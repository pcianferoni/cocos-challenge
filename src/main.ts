import { ConfigService } from '@config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';

import { ignoreFavicon, requestLogger } from '@core/middlewares';

import { AppModule } from './app.module';

async function main() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = new Logger('main');

  const { port, serviceName } = configService.get('app');

  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle(`${serviceName}`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.use(ignoreFavicon);
  app.use(requestLogger);

  app.useLogger(app.get(PinoLogger));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port).then(() => {
    logger.log(`Listening on port: ${port}`);
  });
}
main();
