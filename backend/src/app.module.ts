import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { HeadlineModule } from './headline/headline.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';

@Module({
  imports: [ConfigModule, HeadlineModule, ThumbnailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
