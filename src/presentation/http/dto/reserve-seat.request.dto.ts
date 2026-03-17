import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class ReserveSeatRequestDto {
  @ApiProperty({ type: String, example: 'user-42' })
  @IsString()
  @MaxLength(100)
  public readonly user_id!: string;

  @ApiProperty({ type: Number, example: 123 })
  @IsInt()
  @Min(1)
  public readonly seat_id!: number;
}
