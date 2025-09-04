import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 启用CORS
  app.enableCors({
    origin: configService.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = configService.port;
  await app.listen(port);

  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
  console.log(
    `📝 标题生成器API: http://localhost:${port}/api/headlines/generate`,
  );
  console.log(`🖼️ 缩略图API: http://localhost:${port}/api/thumbnail`);
}

bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
});
