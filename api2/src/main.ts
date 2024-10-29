import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Permitir todas las IPs y dominios
  });

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(13000);
}
bootstrap();
