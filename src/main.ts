import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = [       // Production Frontend URL
    "https://house-frontend-theta.vercel.app",
    "https://house-frontend-theta.vercel.app/signup",
    "https://house-frontend-theta.vercel.app/login",
    "http://localhost:8080",
    "http://localhost:8080/signup",
    "http://localhost:8080/login"
  ]
  app.enableCors({
    origin: origins, 
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
