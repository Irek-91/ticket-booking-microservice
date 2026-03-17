import type { Generated } from 'kysely';

export interface SeatsTable {
  id: number;
  label: string;
  created_at: Generated<Date>;
}

export interface ReservationsTable {
  id: Generated<string>;
  user_id: string;
  seat_id: number;
  created_at: Generated<Date>;
}

export interface DatabaseSchema {
  seats: SeatsTable;
  reservations: ReservationsTable;
}
