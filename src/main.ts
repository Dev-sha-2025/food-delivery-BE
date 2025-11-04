import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Validation
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // do not remove unknown fields
      forbidNonWhitelisted: false, //  allow unknown fields
      transform: true, // auto-transform DTOs
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription('Backend APIs for the food delivery app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
  console.log('📘 Swagger Docs → http://localhost:3000/api/docs');
}
bootstrap();
