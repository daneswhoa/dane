import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'public'));

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log('whoaa apiis on, lfg log - railway deploy triggered');
  console.log(`API running on http://localhost:${port}`);
  console.log('DATABASE_URL connection host:', process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'UNDEFINED');
  console.log('RESEND_API_KEY prefix:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 10) + '...' : 'UNDEFINED');
  console.log('BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL);
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('NEXT_PUBLIC_PORTAL_URL:', process.env.NEXT_PUBLIC_PORTAL_URL);
}

bootstrap();
