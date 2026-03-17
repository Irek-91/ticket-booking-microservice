import type { Reservation } from '../entities/reservation.entity.js';

export interface ReservationRepository {
  seatExists(seatId: number): Promise<boolean>;
  createReservationIfSeatIsFree(userId: string, seatId: number): Promise<Reservation | null>;
}

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');
