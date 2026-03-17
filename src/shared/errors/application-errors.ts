import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/app.constants.js';
import { AppError } from './app-error.js';

export class SeatNotFoundAppError extends AppError {
  public constructor(seatId: number) {
    super(`Seat with id ${seatId} does not exist`, APP_ERROR_CODE.SEAT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class SeatAlreadyReservedAppError extends AppError {
  public constructor(seatId: number) {
    super(
      `Seat with id ${seatId} is already reserved`,
      APP_ERROR_CODE.SEAT_ALREADY_RESERVED,
      HttpStatus.CONFLICT,
    );
  }
}
