import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { MetricsService } from 'src/infrastructure/observability/metrics.service.js';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  public constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
  ) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = performance.now();

    res.on('finish', () => {
      try {
        const route = req.route?.path ?? req.path;

        this.metricsService.observeHttpRequest(
          {
            method: req.method,
            route,
            status: String(res.statusCode),
          },
          performance.now() - startedAt,
        );
      } catch {
        // Metrics collection must never break request handling
      }
    });

    next();
  }
}
