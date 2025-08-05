import { Module } from '@nestjs/common';
import { HeadlineController } from './headline.controller';
import { HeadlineService } from './headline.service';
import { ConfigModule } from '../config/config.module';

/**
 * 标题生成器模块
 */
@Module({
  imports: [ConfigModule],
  controllers: [HeadlineController],
  providers: [HeadlineService],
  exports: [HeadlineService],
})
export class HeadlineModule {}