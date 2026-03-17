import { Inject, Injectable } from '@nestjs/common';

import { SeatAlreadyReservedAppError, SeatNotFoundAppError } from 'src/shared/errors/application-errors.js';

import type { ReserveSeatCommand } from '../contracts/reserve-seat.command.js';
import type { Reservation } from 'src/domain/entities/reservation.entity.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from 'src/domain/repositories/reservation.repository.js';

@Injectable()
export class ReserveSeatUseCase {
  public constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  public async execute(command: ReserveSeatCommand): Promise<Reservation> {
    const seatExists = await this.reservationRepository.seatExists(command.seatId);

    if (!seatExists) {
      throw new SeatNotFoundAppError(command.seatId);
    }

    const reservation = await this.reservationRepository.createReservationIfSeatIsFree(
      command.userId,
      command.seatId,
    );

    if (reservation === null) {
      throw new SeatAlreadyReservedAppError(command.seatId);
    }

    return reservation;
  }
}
