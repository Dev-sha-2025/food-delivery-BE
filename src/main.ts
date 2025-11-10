import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false, // prevent buffering of logs
    cors: true,        // enable CORS for all origins
  });

  //Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // do not remove unknown fields
      forbidNonWhitelisted: false, //  allow unknown fields
      transform: true, // auto-transform DTOs
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription('Backend APIs for the food delivery app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server running on host ${process.env.PORT || 3000}`);
}
bootstrap();
