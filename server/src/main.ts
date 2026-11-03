import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const keyPath = path.join(process.cwd(), 'certs', 'localhost-key.pem');
  const certPath = path.join(process.cwd(), 'certs', 'localhost.pem');
  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

  const app = hasCerts
    ? await NestFactory.create(AppModule, {
        httpsOptions: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
      })
    : await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, 'https://localhost:5173']
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Book Management API')
    .setDescription('API for Book Management System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  const protocol = hasCerts ? 'https' : 'http';
  console.log(
    `🚀 Server is running at ${protocol}://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap();
