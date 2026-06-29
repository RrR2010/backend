import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'
import { PrismaExceptionFilter } from '@shared/filters/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Viver Sorvete API')
    .setDescription(
      'This API is responsible for managing the Viver Sorvete application'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      'accessToken'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Pre-Auth-Token',
        in: 'header'
      },
      'preAuthToken'
    )
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  app.use(cookieParser.default())
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  app.useGlobalFilters(new PrismaExceptionFilter())

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : (
          origin: string | undefined,
          callback: (err: Error | null, origin?: unknown) => void
        ) => {
          // Allow any origin in development (ngrok, LAN IPs, etc.)
          callback(null, origin ?? true)
        },
    credentials: true
  })

  // Wire global guards with proper ordering:
  // 1. JwtAuthGuard - validates JWT and sets request.user
  // 2. AuthorizationGuard - enforces authorization metadata (fail-closed)
  // const reflector = app.get(Reflector)
  // const abilityFactory = app.get(ABILITY_FACTORY)

  // JwtAuthGuard runs first (sets user context)
  // app.useGlobalGuards(
  //   new JwtAuthGuard(reflector),
  //   new AuthorizationGuard(reflector, abilityFactory)
  // )

  await app.listen(process.env.PORT ?? 3001)
}
void bootstrap()
