import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { APP_CONFIG_KEY, type AppConfig } from './config/app.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const documentBuilder = new DocumentBuilder()
    .setTitle('Ticket Booking Microservice')
    .setDescription('API for high-concurrency seat reservations')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>(APP_CONFIG_KEY);

  await app.listen(appConfig.port);
  logger.log(`Application started on port ${appConfig.port}`);
}

void bootstrap();
