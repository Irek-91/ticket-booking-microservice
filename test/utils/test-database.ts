import { createDatabaseConfig } from 'src/config/database.config.js';
import { validateEnv } from 'src/config/env.schema.js';
import { createKyselyDatabase } from 'src/infrastructure/database/database.factory.js';
import { runMigrations } from 'src/infrastructure/database/migrator.js';

export async function migrateTestDatabase(): Promise<void> {
  const db = createKyselyDatabase(createDatabaseConfig(validateEnv(process.env)));

  try {
    await runMigrations(db);
  } finally {
    await db.destroy();
  }
}

export async function clearReservations(): Promise<void> {
  const db = createKyselyDatabase(createDatabaseConfig(validateEnv(process.env)));

  try {
    await db.deleteFrom('reservations').execute();
  } finally {
    await db.destroy();
  }
}
