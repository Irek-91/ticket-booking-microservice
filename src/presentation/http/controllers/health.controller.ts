import { Controller, Get, Header, Inject } from '@nestjs/common';

import { MetricsService } from 'src/infrastructure/observability/metrics.service.js';

@Controller()
export class HealthController {
  public constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
  ) {}

  @Get('health')
  public health(): { readonly status: string } {
    return { status: 'ok' };
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  public async metrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
