import { ApiProperty } from '@nestjs/swagger';

export class ReserveSeatResponseDto {
  @ApiProperty({ type: String, example: 'ec6a5df3-2061-49cc-97f8-a86de0127f31' })
  public readonly reservation_id!: string;

  @ApiProperty({ type: String, example: 'user-42' })
  public readonly user_id!: string;

  @ApiProperty({ type: Number, example: 123 })
  public readonly seat_id!: number;

  @ApiProperty({ type: String, example: '2026-01-01T10:00:00.000Z' })
  public readonly created_at!: string;
}
