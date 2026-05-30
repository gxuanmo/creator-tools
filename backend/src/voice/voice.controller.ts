import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { CloneVoiceDto } from './dto/clone-voice.dto';
import { GenerateSpeechDto } from './dto/generate-speech.dto';

@Controller('api/voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  /**
   * 上传音频文件用于音色克隆
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传音频文件');
    }
    const fileId = await this.voiceService.uploadAudioFile(
      file.buffer,
      file.originalname,
    );
    return { fileId };
  }

  /**
   * 克隆音色
   */
  @Post('clone')
  async cloneVoice(@Body() body: CloneVoiceDto) {
    return this.voiceService.cloneVoice(
      body.fileId,
      body.voiceName,
      body.transcript,
    );
  }

  /**
   * 使用克隆音色生成语音
   */
  @Post('generate')
  async generateSpeech(@Body() body: GenerateSpeechDto) {
    return this.voiceService.generateSpeech(
      body.text,
      body.voiceId,
      body.speed,
      body.volume,
      body.pitch,
    );
  }
}
