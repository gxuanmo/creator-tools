import { IsString, IsOptional } from 'class-validator';

/**
 * 音色克隆请求
 */
export class CloneVoiceDto {
  @IsString({ message: 'fileId 必须为字符串' })
  fileId: string;

  @IsString({ message: 'voiceName 必须为字符串' })
  voiceName: string;

  @IsOptional()
  @IsString({ message: 'transcript 必须为字符串' })
  transcript?: string;
}
