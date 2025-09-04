import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThumbnailData } from './dto/thumbnail-response.dto';

@Injectable()
export class ThumbnailService {
  /**
   * 提取视频缩略图
   * @param {string} url - 视频链接
   * @returns {ThumbnailData} 缩略图数据
   */
  extractThumbnails(url: string): ThumbnailData {
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
   * @param {string} url - 视频链接
   * @returns {string} 平台名称
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
   * @param {string} url - YouTube链接
   * @returns {string} 视频ID
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
        return match[1];
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
   * @param {string} url - YouTube链接
   * @returns {ThumbnailData} 缩略图数据
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
   * @param {string} url - Bilibili链接
   * @returns {string} 视频ID
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
   * @param {string} url - Bilibili链接
   * @returns {ThumbnailData} 缩略图数据
   */
  private extractBilibiliThumbnails(url: string): ThumbnailData {
    const videoId = this.extractBilibiliVideoId(url);

    // 注意：Bilibili的缩略图需要通过API获取，这里提供基础结构
    // 实际项目中需要调用Bilibili API获取真实的缩略图URL
    return {
      platform: 'bilibili',
      videoId,
      thumbnails: {
        default: `https://i0.hdslb.com/bfs/archive/${videoId}.jpg`,
        medium: `https://i0.hdslb.com/bfs/archive/${videoId}.jpg@320w_200h_1c.webp`,
        high: `https://i0.hdslb.com/bfs/archive/${videoId}.jpg@480w_300h_1c.webp`,
        maxres: `https://i0.hdslb.com/bfs/archive/${videoId}.jpg@720w_450h_1c.webp`,
      },
    };
  }
}
