import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

/**
 * 生成标题请求DTO
 */
export class GenerateHeadlineDto {
  /**
   * 主题内容
   */
  @IsString()
  @MinLength(1, { message: '主题不能为空' })
  @MaxLength(500, { message: '主题长度不能超过500字符' })
  topic: string;

  /**
   * 关键词（可选）
   */
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '关键词长度不能超过200字符' })
  keywords?: string;

  /**
   * 平台类型（可选）
   */
  @IsOptional()
  @IsIn(['youtube', 'tiktok', 'instagram', 'twitter', 'blog', 'general'], {
    message: '平台类型必须是: youtube, tiktok, instagram, twitter, blog, general 之一',
  })
  platform?: string;

  /**
   * 语调风格（可选）
   */
  @IsOptional()
  @IsIn(['professional', 'casual', 'humorous', 'dramatic', 'informative'], {
    message: '语调风格必须是: professional, casual, humorous, dramatic, informative 之一',
  })
  tone?: string;

  /**
   * 生成数量（可选，默认5个）
   */
  @IsOptional()
  count?: number = 5;
}

/**
 * 生成标题响应DTO
 */
export class HeadlineResponseDto {
  /**
   * 生成的标题列表
   */
  headlines: string[];

  /**
   * 生成时间戳
   */
  timestamp: string;

  /**
   * 使用的参数
   */
  parameters: {
    topic: string;
    keywords?: string;
    platform?: string;
    tone?: string;
    count: number;
  };
}