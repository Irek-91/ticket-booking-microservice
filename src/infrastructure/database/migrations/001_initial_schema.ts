import { sql, type Kysely } from 'kysely';

import type { DatabaseSchema } from '../db.types.js';

const SEAT_COUNT = 1000;

export async function up(db: Kysely<DatabaseSchema>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);

  await db.schema
    .createTable('seats')
    .ifNotExists()
    .addColumn('id', 'integer', (column) => column.primaryKey())
    .addColumn('label', 'varchar(20)', (column) => column.notNull().unique())
    .addColumn('created_at', 'timestamptz', (column) => column.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('reservations')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) => column.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('user_id', 'varchar(100)', (column) => column.notNull())
    .addColumn('seat_id', 'integer', (column) => column.notNull().references('seats.id').onDelete('restrict'))
    .addColumn('created_at', 'timestamptz', (column) => column.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('reservations_seat_id_unique', ['seat_id'])
    .execute();

  await db.schema
    .createIndex('reservations_user_id_idx')
    .ifNotExists()
    .on('reservations')
    .column('user_id')
    .execute();

  const seats = Array.from({ length: SEAT_COUNT }, (_, index) => ({
    id: index + 1,
    label: `A-${index + 1}`,
  }));

  await db
    .insertInto('seats')
    .values(seats)
    .onConflict((oc) => oc.column('id').doNothing())
    .execute();
}

export async function down(db: Kysely<DatabaseSchema>): Promise<void> {
  await db.schema.dropTable('reservations').ifExists().execute();
  await db.schema.dropTable('seats').ifExists().execute();
}
