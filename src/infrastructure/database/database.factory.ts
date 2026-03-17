import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import type { DatabaseConfig } from 'src/config/database.config.js';

import type { DatabaseSchema } from './db.types.js';

const { Pool } = pg;

export function createKyselyDatabase(config: DatabaseConfig): Kysely<DatabaseSchema> {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl,
    max: 25,
    min: 5,
  });

  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool,
    }),
  });
}
