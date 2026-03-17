import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ReserveSeatRequestDto } from '../dto/reserve-seat.request.dto.js';
import { ReserveSeatResponseDto } from '../dto/reserve-seat.response.dto.js';

export function ReserveSeatSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Reserve seat for user' }),
    ApiBody({ type: ReserveSeatRequestDto }),
    ApiCreatedResponse({ type: ReserveSeatResponseDto }),
    ApiNotFoundResponse({ description: 'Seat does not exist' }),
    ApiConflictResponse({ description: 'Seat already reserved' }),
  );
}
