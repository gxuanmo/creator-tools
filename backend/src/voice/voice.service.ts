import {
  Injectable,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '../config/config.service';

interface MiniMaxUploadResponse {
  file?: { file_id?: string };
}

interface MiniMaxCloneResponse {
  voice_id: string;
  preview_audio?: string;
}

export interface MiniMaxTtsResponse {
  audio_url?: string;
}

@Injectable()
export class VoiceService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @param file 音频文件 Buffer
   * @param fileName 原始文件名
   * @returns MiniMax 返回的 file_id
   */
  async uploadAudioFile(file: Buffer, fileName: string): Promise<string> {
    const apiKey = this.getApiKey();

    const formData = new FormData();
    formData.append('file', new Blob([file]), fileName);
    formData.append('purpose', 'voice_clone');

    const response = await this.fetchWithTimeout(
      'https://api.minimaxi.chat/v1/files/upload',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      },
    );

    const data = (await response.json()) as MiniMaxUploadResponse;
    const fileId = data.file?.file_id;
    if (!fileId) {
      throw new BadGatewayException('MiniMax 上传失败：未返回有效的 file_id');
    }
    return fileId;
  }

  /**
   * @param fileId 上传后的 file_id
   * @param voiceName 音色名称
   * @param transcript 可选的文字稿
   */
  async cloneVoice(
    fileId: string,
    voiceName: string,
    transcript?: string,
  ): Promise<{ voiceId: string; previewAudio?: string }> {
    const apiKey = this.getApiKey();

    const response = await this.fetchWithTimeout(
      'https://api.minimaxi.chat/v1/voice_clone',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          voice_name: voiceName,
          transcript: transcript || undefined,
          preview: {
            text: '这是音色克隆的预览效果，您可以听听是否满意。',
            model: 'speech-01-hd',
          },
        }),
      },
    );

    const data = (await response.json()) as MiniMaxCloneResponse;
    if (!data.voice_id) {
      throw new BadGatewayException('MiniMax 音色克隆失败：未返回 voice_id');
    }
    return { voiceId: data.voice_id, previewAudio: data.preview_audio };
  }

  /**
   * @param text 要合成的文本
   * @param voiceId 克隆音色 ID
   * @param speed 语速
   * @param volume 音量
   * @param pitch 音调
   */
  async generateSpeech(
    text: string,
    voiceId: string,
    speed?: number,
    volume?: number,
    pitch?: number,
  ): Promise<{ audioUrl?: string; audioData?: MiniMaxTtsResponse }> {
    const apiKey = this.getApiKey();

    const response = await this.fetchWithTimeout(
      'https://api.minimaxi.chat/v1/t2a_v2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'speech-01-hd',
          text,
          voice_id: voiceId,
          speed: speed ?? 1,
          vol: volume ?? 1,
          pitch: pitch ?? 0,
        }),
      },
    );

    const data = (await response.json()) as MiniMaxTtsResponse;
    if (!data.audio_url) {
      throw new BadGatewayException('MiniMax 语音生成失败：未返回 audio_url');
    }
    return { audioUrl: data.audio_url };
  }

  private getApiKey(): string {
    const key = this.configService.minimaxApiKey;
    if (!key) {
      throw new BadRequestException(
        'MiniMax API密钥未配置，请检查环境变量 MINIMAX_API_KEY',
      );
    }
    return key;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs = 30000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        ...init,
      });
      if (!response.ok) {
        const body = await response.text();
        throw new BadGatewayException(
          `MiniMax API 错误 (${response.status}): ${body}`,
        );
      }
      // MiniMax 可能在 HTTP 200 中返回业务错误码
      const cloned = response.clone();
      const data = (await cloned.json()) as Record<string, unknown>;
      const errorCode = data.code as number | undefined;
      const errorMsg = data.message as string | undefined;
      if (errorCode && errorCode !== 0) {
        throw new BadGatewayException(
          `MiniMax API 业务错误 (code=${String(errorCode)}): ${errorMsg || '未知错误'}`,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      const msg = error instanceof Error ? error.message : String(error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadGatewayException('MiniMax API 请求超时');
      }
      throw new BadGatewayException(`MiniMax API 请求失败: ${msg}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
