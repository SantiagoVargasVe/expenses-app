import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { buildValidationErrorResponse } from './common/validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((origin) =>
    origin.trim(),
  ) ?? ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  console.log('Running on', 'http://localhost:3000');

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(buildValidationErrorResponse(errors)),
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
