import { Inject, Injectable } from '@nestjs/common';
import type { Reservation } from 'src/domain/entities/reservation.entity.js';
import type { ReservationRepository } from 'src/domain/repositories/reservation.repository.js';

import { KyselyDatabaseService } from '../services/kysely-database.service.js';

@Injectable()
export class KyselyReservationRepository implements ReservationRepository {
  public constructor(
    @Inject(KyselyDatabaseService)
    private readonly databaseService: KyselyDatabaseService,
  ) {}

  public async seatExists(seatId: number): Promise<boolean> {
    const seat = await this.databaseService.db
      .selectFrom('seats')
      .select('id')
      .where('id', '=', seatId)
      .executeTakeFirst();

    return seat !== undefined;
  }

  public async createReservationIfSeatIsFree(userId: string, seatId: number): Promise<Reservation | null> {
    const inserted = await this.databaseService.db
      .insertInto('reservations')
      .values({
        user_id: userId,
        seat_id: seatId,
      })
      .onConflict((oc) => oc.column('seat_id').doNothing())
      .returning(['id', 'user_id', 'seat_id', 'created_at'])
      .executeTakeFirst();

    if (inserted === undefined) {
      return null;
    }

    return {
      id: inserted.id,
      userId: inserted.user_id,
      seatId: inserted.seat_id,
      createdAt: inserted.created_at,
    };
  }
}
