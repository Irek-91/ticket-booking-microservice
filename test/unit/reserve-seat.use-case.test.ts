import { describe, expect, it, vi } from 'vitest';

import { ReserveSeatUseCase } from 'src/application/use-cases/reserve-seat.use-case.js';
import type { Reservation } from 'src/domain/entities/reservation.entity.js';
import type { ReservationRepository } from 'src/domain/repositories/reservation.repository.js';
import { SeatAlreadyReservedAppError, SeatNotFoundAppError } from 'src/shared/errors/application-errors.js';

function createReservation(): Reservation {
  return {
    id: '2f7f4c9f-bf43-4778-9c50-3e2b568fc100',
    seatId: 10,
    userId: 'user-1',
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
  };
}

describe('ReserveSeatUseCase', () => {
  it('reserves seat when seat exists and is free', async () => {
    const repository: ReservationRepository = {
      seatExists: vi.fn().mockResolvedValue(true),
      createReservationIfSeatIsFree: vi.fn().mockResolvedValue(createReservation()),
    };

    const useCase = new ReserveSeatUseCase(repository);

    const result = await useCase.execute({ userId: 'user-1', seatId: 10 });

    expect(result.id).toBe('2f7f4c9f-bf43-4778-9c50-3e2b568fc100');
    expect(repository.createReservationIfSeatIsFree).toHaveBeenCalledWith('user-1', 10);
  });

  it('throws not found when seat does not exist', async () => {
    const repository: ReservationRepository = {
      seatExists: vi.fn().mockResolvedValue(false),
      createReservationIfSeatIsFree: vi.fn(),
    };

    const useCase = new ReserveSeatUseCase(repository);

    await expect(useCase.execute({ userId: 'user-1', seatId: 99_999 })).rejects.toBeInstanceOf(
      SeatNotFoundAppError,
    );
  });

  it('throws conflict when seat already reserved', async () => {
    const repository: ReservationRepository = {
      seatExists: vi.fn().mockResolvedValue(true),
      createReservationIfSeatIsFree: vi.fn().mockResolvedValue(null),
    };

    const useCase = new ReserveSeatUseCase(repository);

    await expect(useCase.execute({ userId: 'user-1', seatId: 10 })).rejects.toBeInstanceOf(
      SeatAlreadyReservedAppError,
    );
  });
});
