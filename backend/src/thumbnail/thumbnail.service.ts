import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThumbnailData } from './dto/thumbnail-response.dto';

interface BilibiliApiResponse {
  code: number;
  message?: string;
  data?: { pic?: string };
}

@Injectable()
export class ThumbnailService {
  /**
   * 提取视频缩略图
   */
  async extractThumbnails(url: string): Promise<ThumbnailData> {
    const platform = this.detectPlatform(url);

    switch (platform) {
      case 'youtube':
        return this.extractYouTubeThumbnails(url);
      case 'bilibili':
        return this.extractBilibiliThumbnails(url);
      default:
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_PLATFORM',
              message: '不支持的视频平台',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  /**
   * 检测视频平台
   */
  private detectPlatform(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    return 'unknown';
  }

  /**
   * 提取YouTube视频ID
   */
  private extractYouTubeVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/v\/)([\w-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        if (!/^[\w-]{11}$/.test(videoId)) {
          throw new HttpException(
            {
              success: false,
              error: {
                code: 'INVALID_VIDEO_ID',
                message: 'YouTube视频ID格式无效（应为11位字母数字）',
              },
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        return videoId;
      }
    }

    throw new HttpException(
      {
        success: false,
        error: {
          code: 'INVALID_YOUTUBE_URL',
          message: '无效的YouTube视频链接',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * 提取YouTube缩略图
   */
  private extractYouTubeThumbnails(url: string): ThumbnailData {
    const videoId = this.extractYouTubeVideoId(url);

    return {
      platform: 'youtube',
      videoId,
      thumbnails: {
        default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
        medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      },
    };
  }

  /**
   * 提取Bilibili视频ID
   */
  private extractBilibiliVideoId(url: string): string {
    const patterns = [
      /(?:bilibili\.com\/video\/)([\w-]+)/,
      /(?:b23\.tv\/)([\w-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new HttpException(
      {
        success: false,
        error: {
          code: 'INVALID_BILIBILI_URL',
          message: '无效的Bilibili视频链接',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * 提取Bilibili缩略图
   * @param url Bilibili视频链接
   * @returns 缩略图数据（通过Bilibili API获取真实封面URL）
   */
  private async extractBilibiliThumbnails(url: string): Promise<ThumbnailData> {
    const videoId = this.extractBilibiliVideoId(url);

    try {
      const apiUrl = videoId.startsWith('BV')
        ? `https://api.bilibili.com/x/web-interface/view?bvid=${videoId}`
        : `https://api.bilibili.com/x/web-interface/view?aid=${videoId.replace(/^av/i, '')}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://www.bilibili.com',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Bilibili API responded with ${response.status}`);
      }

      const data = (await response.json()) as BilibiliApiResponse;

      if (data.code !== 0 || !data.data?.pic) {
        throw new Error(data.message ?? '无法获取视频信息');
      }

      const pic = data.data.pic.replace(/^http:/, 'https:');

      return {
        platform: 'bilibili',
        videoId,
        thumbnails: {
          default: `${pic}@320w_200h_1c.webp`,
          medium: `${pic}@480w_300h_1c.webp`,
          high: `${pic}@720w_450h_1c.webp`,
          maxres: pic,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'BILIBILI_API_ERROR',
            message: `获取Bilibili封面失败: ${msg}`,
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
