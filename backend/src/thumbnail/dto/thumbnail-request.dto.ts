import { IsUrl } from 'class-validator';

/**
 * 缩略图请求参数
 */
export class ThumbnailRequestDto {
  /**
   * 视频链接
   */
  @IsUrl({}, { message: '视频链接必须是有效的URL' })
  url: string;
}
