import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { PrismaExceptionFilter } from './common/global-filters/prisma-exception.filter';
import { HttpExceptionFilter } from './common/global-filters/http-exception-filter';
import { allLeftOverExceptionFilter } from './common/global-filters/all-leftover-exception-filter';
import { SocketIOAdapter } from './common/io-adapter/socket-io-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.BACKEND_PORT || 8100);
}
bootstrap();
