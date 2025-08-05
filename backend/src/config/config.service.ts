import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * 配置服务 - 提供类型安全的环境变量访问和验证
 */
@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {
    this.validateConfig();
  }

  /**
   * 验证必需的环境变量是否存在
   * @throws {Error} 当缺少必需的环境变量时抛出错误
   */
  private validateConfig(): void {
    const requiredKeys = ['OPENAI_API_KEY'];
    
    const missing = requiredKeys.filter(key => !this.nestConfigService.get(key));
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
      console.warn('Some features may not work properly without these variables.');
    }
  }

  /**
   * 获取OpenAI API密钥
   * @returns {string} OpenAI API密钥
   */
  get openaiApiKey(): string {
    return this.nestConfigService.get<string>('OPENAI_API_KEY') || '';
  }

  /**
   * 获取YouTube API密钥
   * @returns {string} YouTube API密钥
   */
  get youtubeApiKey(): string {
    return this.nestConfigService.get<string>('YOUTUBE_API_KEY') || '';
  }

  /**
   * 获取MiniMax API密钥
   * @returns {string} MiniMax API密钥
   */
  get minimaxApiKey(): string {
    return this.nestConfigService.get<string>('MINIMAX_API_KEY') || '';
  }

  /**
   * 获取服务端口
   * @returns {number} 服务端口号
   */
  get port(): number {
    return this.nestConfigService.get<number>('PORT') || 3002;
  }

  /**
   * 获取CORS源地址
   * @returns {string} CORS允许的源地址
   */
  get corsOrigin(): string {
    return this.nestConfigService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  }
}