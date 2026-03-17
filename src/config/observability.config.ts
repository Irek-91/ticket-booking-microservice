import type { Env } from './env.schema.js';

export interface ObservabilityConfig {
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
}

export const OBSERVABILITY_CONFIG_KEY = 'observability';

export function createObservabilityConfig(env: Env): ObservabilityConfig {
  return {
    logLevel: env.LOG_LEVEL,
  };
}
