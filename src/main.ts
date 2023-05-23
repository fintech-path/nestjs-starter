import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';

const logger = new Logger('App');
const PORT = process.env.PORT || 3333;
const ENV = process.env.ENV || 'DEV';
const HTTPS_ENABLED = false;
const CORS_ORIGINS = [
  'http://127.0.0.1:8080',
  'http://localhost:8080',
  'http://127.0.0.1:3333',
  'http://localhost:3333',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
];

async function bootstrap() {
  let app;
  if (ENV === 'PROD' && HTTPS_ENABLED) {
    app = await NestFactory.create(AppModule, getHttpsOptions());
  } else {
    app = await NestFactory.create(AppModule);
  }
  app.use(
    compression({
      // compress all responses
      threshold: 0,
    }),
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
      verify: (req, res, buf) => {
        (req as any).rawBody = buf.toString();
      },
    }),
  );

  app.use(helmet());

  app.enableCors({
    origin: CORS_ORIGINS,
    allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type', 'Accept'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  createSwaggerIfNotProdEnv(app);
  await app.listen(PORT, '0.0.0.0');
  logServerStartupStatus(app);
}

bootstrap();

function getHttpsOptions() {
  return {
    httpsOptions: {
      // Based on the NestJS documentation, the httpsOptions object passed to NestFactory.create() can include a key property,
      // which is used to specify the private key file for SSL / TLS encryption.However, this property is optional,
      // and if it is not provided, the server will use a self- signed certificate by default.
      // key: fs.readFileSync('src/common/security/ssl/key.pem'),
      // cert: fs.readFileSync('src/common/security/ssl/cert.pem'),
    },
  };
}

async function createSwaggerIfNotProdEnv(app) {
  if (ENV === 'PROD') {
    return;
  }
  const config = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}

async function logServerStartupStatus(app) {
  logger.log(`Application is running on: ${await app.getUrl()}`);
  if (ENV === 'PROD') {
    return;
  }
  logger.log(`Swagger: ${await app.getUrl()}/swagger`);
  logger.log(`Swagger JSON: ${await app.getUrl()}/swagger-json`);
}
