import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = [
    "https://house-frontend-jvkk.onrender.com/",
    "https://house-frontend-jvkk.onrender.com/signup",
    "https://house-frontend-jvkk.onrender.com/login"
  ]
  app.enableCors({
    origin: origins, // Production Frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    exposedHeaders: ['Set-Cookie','Authorization'],
   });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(4000);
}
bootstrap();
