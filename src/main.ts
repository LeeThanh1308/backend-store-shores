import * as bodyParser from 'body-parser';

import {
  BadRequestException,
  ConflictException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';

import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: true,
    methods: ['*'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const handleFormatErrorChildren = (array: any) =>
          array.reduce((acc, err) => {
            if (err.constraints) {
              acc.push(Object.values(err.constraints)[0]); // Chỉ lấy lỗi đầu tiên nếu có
            }
            if (Array.isArray(err.children) && err.children?.length > 0) {
              acc.push(handleFormatErrorChildren(err.children));
            }
            return acc;
          }, []);
        const formattedErrors = errors.reduce(
          (acc, err) => {
            if (err.constraints) {
              acc[err.property] = Object.values(err.constraints)[0]; // Chỉ lấy lỗi đầu tiên nếu có
            }
            if (Array.isArray(err.children) && err.children?.length > 0) {
              acc[err.property] = handleFormatErrorChildren(err.children);
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        return new ConflictException({
          validators: formattedErrors,
        });
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port, () => {
    Logger.log(`Listening on http://localhost:${port}`);
  });
}
bootstrap();
