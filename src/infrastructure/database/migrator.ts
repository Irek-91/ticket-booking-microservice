import { Migrator, type Migration, type MigrationProvider } from 'kysely';

import type { Kysely } from 'kysely';

import type { DatabaseSchema } from './db.types.js';
import * as migration001 from './migrations/001_initial_schema.js';

class StaticMigrationProvider implements MigrationProvider {
  public async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '001_initial_schema': migration001,
    };
  }
}

export async function runMigrations(db: Kysely<DatabaseSchema>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new StaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error !== undefined) {
    throw error;
  }

  const hasFailedMigration = results?.some((result) => result.status === 'Error') ?? false;

  if (hasFailedMigration) {
    throw new Error('Failed to apply one or more migrations');
  }
}
