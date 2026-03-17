import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ReserveSeatUseCase } from 'src/application/use-cases/reserve-seat.use-case.js';

import { ReserveSeatRequestDto } from '../dto/reserve-seat.request.dto.js';
import type { ReserveSeatResponseDto } from '../dto/reserve-seat.response.dto.js';
import { ReserveSeatSwagger } from '../swagger/reservations.swagger.js';

@Controller()
@ApiTags('Reservations')
export class ReservationsController {
  public constructor(
    @Inject(ReserveSeatUseCase)
    private readonly reserveSeatUseCase: ReserveSeatUseCase,
  ) {}

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ReserveSeatSwagger()
  public async reserve(@Body() dto: ReserveSeatRequestDto): Promise<ReserveSeatResponseDto> {
    const reservation = await this.reserveSeatUseCase.execute({
      userId: dto.user_id,
      seatId: dto.seat_id,
    });

    return {
      reservation_id: reservation.id,
      user_id: reservation.userId,
      seat_id: reservation.seatId,
      created_at: reservation.createdAt.toISOString(),
    };
  }
}
