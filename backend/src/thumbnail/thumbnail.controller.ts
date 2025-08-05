import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { ApiQuery } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { ThumbnailService } from './thumbnail.service';
import { ThumbnailResponseDto } from './dto/thumbnail-response.dto';

@ApiTags('thumbnail')
@Controller('api/thumbnail')
export class ThumbnailController {
  constructor(private readonly thumbnailService: ThumbnailService) {}

  @Get()
  @ApiOperation({ summary: '获取视频封面缩略图' })
  @ApiQuery({ name: 'url', description: '视频链接', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @ApiResponse({ status: 200, description: '成功获取缩略图', type: ThumbnailResponseDto })
  @ApiResponse({ status: 400, description: '无效的视频链接' })
  @ApiResponse({ status: 404, description: '视频不存在或无法访问' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getThumbnail(@Query('url') url: string): Promise<ThumbnailResponseDto> {
    if (!url) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'MISSING_URL',
            message: '缺少视频链接参数'
          }
        },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const thumbnailData = await this.thumbnailService.extractThumbnails(url);
      return {
        success: true,
        data: thumbnailData
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'EXTRACTION_FAILED',
            message: '缩略图提取失败'
          }
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务正常' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thumbnail-extractor'
    };
  }
}
