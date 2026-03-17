import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Logger, LoggerModule } from 'nestjs-pino';

import { ReserveSeatUseCase } from './application/use-cases/reserve-seat.use-case.js';
import { APP_CONFIG_KEY, type AppConfig } from './config/app.config.js';
import { validateEnv } from './config/env.schema.js';
import { OBSERVABILITY_CONFIG_KEY, type ObservabilityConfig } from './config/observability.config.js';
import { rootConfig } from './config/root.config.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { MetricsService } from './infrastructure/observability/metrics.service.js';
import { HealthController } from './presentation/http/controllers/health.controller.js';
import { ReservationsController } from './presentation/http/controllers/reservations.controller.js';
import { GlobalExceptionFilter } from './shared/http/filters/global-exception.filter.js';
import { RequestIdInterceptor } from './shared/http/interceptors/request-id.interceptor.js';
import { HttpMetricsMiddleware } from './shared/http/middleware/http-metrics.middleware.js';
import { RequestContextMiddleware } from './shared/http/middleware/request-context.middleware.js';
import { RequestContextService } from './shared/http/request-context.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [rootConfig],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const observabilityConfig = configService.getOrThrow<ObservabilityConfig>(OBSERVABILITY_CONFIG_KEY);
        const appConfig = configService.getOrThrow<AppConfig>(APP_CONFIG_KEY);

        return {
          pinoHttp: {
            level: observabilityConfig.logLevel,
            transport: appConfig.nodeEnv === 'development' ? { target: 'pino-pretty' } : undefined,
            autoLogging: true,
          },
        };
      },
    }),
    DatabaseModule,
  ],
  controllers: [ReservationsController, HealthController],
  providers: [
    Logger,
    RequestContextService,
    MetricsService,
    RequestContextMiddleware,
    HttpMetricsMiddleware,
    ReserveSeatUseCase,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware, HttpMetricsMiddleware).forRoutes('*');
  }
}
