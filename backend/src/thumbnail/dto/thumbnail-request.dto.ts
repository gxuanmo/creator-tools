import { IsUrl, IsNotEmpty } from 'class-validator';

/**
 * 缩略图请求参数
 */
export class ThumbnailRequestDto {
  /**
   * 视频链接（仅允许 HTTPS）
   */
  @IsNotEmpty({ message: '视频链接为必填' })
  @IsUrl(
    { protocols: ['https'] },
    { message: '视频链接必须是有效的 HTTPS URL' },
  )
  url: string;
}
