import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * 语音生成请求
 */
export class GenerateSpeechDto {
  @IsString({ message: 'text 必须为字符串' })
  text: string;

  @IsString({ message: 'voiceId 必须为字符串' })
  voiceId: string;

  @IsOptional()
  @IsNumber({}, { message: 'speed 必须为数字' })
  @Min(0.5, { message: 'speed 不能小于 0.5' })
  @Max(2.0, { message: 'speed 不能大于 2.0' })
  speed?: number;

  @IsOptional()
  @IsNumber({}, { message: 'volume 必须为数字' })
  @Min(0, { message: 'volume 不能小于 0' })
  @Max(1, { message: 'volume 不能大于 1' })
  volume?: number;

  @IsOptional()
  @IsNumber({}, { message: 'pitch 必须为数字' })
  @Min(-12, { message: 'pitch 不能小于 -12' })
  @Max(12, { message: 'pitch 不能大于 12' })
  pitch?: number;
}
