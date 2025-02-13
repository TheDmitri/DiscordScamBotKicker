import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  
  // Start the application
  await app.listen(3000);
  logger.log('Discord Scam Bot Kicker is running');
}

bootstrap();
