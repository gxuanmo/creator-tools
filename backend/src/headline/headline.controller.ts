import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { HeadlineService } from './headline.service';
import { GenerateHeadlineDto, HeadlineResponseDto } from './dto/generate-headline.dto';

/**
 * 标题生成器控制器
 */
@Controller('api/headlines')
export class HeadlineController {
  constructor(private readonly headlineService: HeadlineService) {}

  /**
   * 生成标题接口
   * @param {GenerateHeadlineDto} dto - 生成标题的请求参数
   * @returns {Promise<HeadlineResponseDto>} 生成的标题响应
   */
  @Post('generate')
  async generateHeadlines(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: GenerateHeadlineDto,
  ): Promise<HeadlineResponseDto> {
    return this.headlineService.generateHeadlines(dto);
  }

  /**
   * 健康检查接口
   * @returns {object} 服务状态
   */
  @Post('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}