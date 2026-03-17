import type { Env } from './env.schema.js';

export interface AppConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
}

export const APP_CONFIG_KEY = 'app';

export function createAppConfig(env: Env): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
}
