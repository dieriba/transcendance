import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { PrismaExceptionFilter } from './common/global-filters/prisma-exception.filter';
import { HttpExceptionFilter } from './common/global-filters/http-exception-filter';
import { allLeftOverExceptionFilter } from './common/global-filters/all-leftover-exception-filter';
import { SocketIOAdapter } from './common/io-adapter/socket-io-adapter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const clientPort = parseInt(process.env.FRONTEND_PORT);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  );

  app.useWebSocketAdapter(new SocketIOAdapter(app));
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new allLeftOverExceptionFilter(),
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(httpAdapterHost),
  );
  app.enableCors({
    origin: [`http://localhost:${clientPort}`],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '../..', 'public/avatar'));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  await app.listen(process.env.BACKEND_PORT || 8100);
}
bootstrap();
