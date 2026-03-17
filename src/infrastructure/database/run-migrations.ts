import 'reflect-metadata';

import { createDatabaseConfig } from 'src/config/database.config.js';
import { validateEnv } from 'src/config/env.schema.js';

import { createKyselyDatabase } from './database.factory.js';
import { runMigrations } from './migrator.js';

async function main(): Promise<void> {
  const env = validateEnv(process.env);
  const db = createKyselyDatabase(createDatabaseConfig(env));

  try {
    await runMigrations(db);
  } finally {
    await db.destroy();
  }
}

void main();
