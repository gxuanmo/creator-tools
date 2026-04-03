import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { ApiQuery } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { ThumbnailService } from './thumbnail.service';
import { ThumbnailResponseDto } from './dto/thumbnail-response.dto';
import { ThumbnailRequestDto } from './dto/thumbnail-request.dto';

@ApiTags('thumbnail')
@Controller('api/thumbnail')
export class ThumbnailController {
  constructor(private readonly thumbnailService: ThumbnailService) {}

  @Get()
  @ApiOperation({ summary: '获取视频封面缩略图' })
  @ApiQuery({
    name: 'url',
    description: '视频链接',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取缩略图',
    type: ThumbnailResponseDto,
  })
  @ApiResponse({ status: 400, description: '无效的视频链接' })
  @ApiResponse({ status: 404, description: '视频不存在或无法访问' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  /**
   * 获取视频缩略图
   * @param {ThumbnailRequestDto} query - 请求参数
   * @returns {ThumbnailResponseDto} 缩略图信息
   */
  getThumbnail(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ThumbnailRequestDto,
  ): ThumbnailResponseDto {
    const { url } = query;

    try {
      const thumbnailData = this.thumbnailService.extractThumbnails(url);
      return {
        success: true,
        data: thumbnailData,
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
            message: '缩略图提取失败',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务正常' })
  /**
   * 健康检查
   * @returns {{ status: string; timestamp: string; service: string }} 服务状态
   */
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thumbnail-extractor',
    };
  }
}
