import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getAppDataSource } from './db/data-source';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT ?? 3000);
  const swaggerPath = 'api/docs';

  const dataSource = await getAppDataSource();
  const executedMigrations = await dataSource.runMigrations();
  logger.log(`Migrations executed on startup: ${executedMigrations.length}`);

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pos Soat Car Sale API')
    .setDescription('API documentation for the car listing project')
    .setVersion('1.0')
    .addTag('vehicles')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, swaggerDocument);

  await app.listen(port);

  const appUrl = await app.getUrl();
  logger.log(`Application running on port: ${port}`);
  logger.log(`Swagger available at: ${appUrl}/${swaggerPath}`);
}
void bootstrap();
