import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
  type CounterConfiguration,
  type HistogramConfiguration,
} from 'prom-client';

interface Labels {
  readonly method: string;
  readonly route: string;
  readonly status: string;
}

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequestsTotal: Counter<'method' | 'route' | 'status'>;
  private readonly httpRequestDurationMs: Histogram<'method' | 'route' | 'status'>;

  public constructor() {
    collectDefaultMetrics({ register: this.registry });

    const counterConfig: CounterConfiguration<'method' | 'route' | 'status'> = {
      name: 'http_requests_total',
      help: 'Total count of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    };

    const histogramConfig: HistogramConfiguration<'method' | 'route' | 'status'> = {
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000],
      registers: [this.registry],
    };

    this.httpRequestsTotal = new Counter(counterConfig);
    this.httpRequestDurationMs = new Histogram(histogramConfig);
  }

  public observeHttpRequest(labels: Labels, durationMs: number): void {
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationMs.observe(labels, durationMs);
  }

  public getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public getContentType(): string {
    return this.registry.contentType;
  }
}
