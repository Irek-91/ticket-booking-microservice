import { createRootConfig, type RootConfig } from './config.factory.js';
import { validateEnv } from './env.schema.js';

export function rootConfig(): RootConfig {
  return createRootConfig(validateEnv(process.env));
}
