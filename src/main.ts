import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { JwtAuthGuard } from '@modules/authentication/infra/jwt-auth.guard';
import { AuthorizationGuard, ABILITY_FACTORY } from '@modules/authorization';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Viver Sorvete API')
    .setDescription(
      'This API is responsible for managing the Viver Sorvete application',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'accessToken',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Pre-Auth-Token',
        in: 'header',
      },
      'preAuthToken',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(cookieParser.default());

  // Get allowed origins from environment variable (comma-separated)
  // Fallback to FRONTEND_URL or localhost:3000
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Wire global guards with proper ordering:
  // 1. JwtAuthGuard - validates JWT and sets request.user
  // 2. AuthorizationGuard - enforces authorization metadata (fail-closed)
  const reflector = app.get(Reflector);
  const abilityFactory = app.get(ABILITY_FACTORY);

  // JwtAuthGuard runs first (sets user context)
  app.useGlobalGuards(new JwtAuthGuard(reflector), new AuthorizationGuard(reflector, abilityFactory));

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
