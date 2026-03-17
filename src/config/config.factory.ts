import { createAppConfig } from './app.config.js';
import { createDatabaseConfig } from './database.config.js';
import { createObservabilityConfig } from './observability.config.js';
import type { Env } from './env.schema.js';

export interface RootConfig {
  readonly app: ReturnType<typeof createAppConfig>;
  readonly database: ReturnType<typeof createDatabaseConfig>;
  readonly observability: ReturnType<typeof createObservabilityConfig>;
}

export function createRootConfig(env: Env): RootConfig {
  return {
    app: createAppConfig(env),
    database: createDatabaseConfig(env),
    observability: createObservabilityConfig(env),
  };
}
