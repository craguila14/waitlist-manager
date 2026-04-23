  process.env.TZ = 'UTC';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );

 app.enableCors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ];

    const isVercel = origin?.endsWith('.vercel.app');

    if (!origin || isVercel || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
});

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend corriendo en http://localhost:${port}`);
}

bootstrap();