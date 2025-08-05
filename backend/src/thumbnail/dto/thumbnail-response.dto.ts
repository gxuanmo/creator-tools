import { ApiProperty } from '@nestjs/swagger';

export class ThumbnailQuality {
  @ApiProperty({ description: '默认质量缩略图URL', example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg' })
  default: string;

  @ApiProperty({ description: '中等质量缩略图URL', example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' })
  medium: string;

  @ApiProperty({ description: '高质量缩略图URL', example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' })
  high: string;

  @ApiProperty({ description: '最高质量缩略图URL', example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' })
  maxres: string;
}

export class ThumbnailData {
  @ApiProperty({ description: '视频平台', example: 'youtube', enum: ['youtube', 'bilibili'] })
  platform: string;

  @ApiProperty({ description: '视频ID', example: 'dQw4w9WgXcQ' })
  videoId: string;

  @ApiProperty({ description: '不同质量的缩略图URL', type: ThumbnailQuality })
  thumbnails: ThumbnailQuality;
}

export class ThumbnailResponseDto {
  @ApiProperty({ description: '请求是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '缩略图数据', type: ThumbnailData })
  data: ThumbnailData;
}

export class ThumbnailErrorDto {
  @ApiProperty({ description: '请求是否成功', example: false })
  success: boolean;

  @ApiProperty({ 
    description: '错误信息',
    example: {
      code: 'INVALID_URL',
      message: '无效的视频链接'
    }
  })
  error: {
    code: string;
    message: string;
  };
}
