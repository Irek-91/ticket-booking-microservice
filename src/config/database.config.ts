import type { Env } from './env.schema.js';

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly database: string;
  readonly ssl: boolean;
}

export const DATABASE_CONFIG_KEY = 'database';

export function createDatabaseConfig(env: Env): DatabaseConfig {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.DB_SSL,
  };
}
