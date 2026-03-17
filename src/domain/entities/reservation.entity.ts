export interface Reservation {
  readonly id: string;
  readonly userId: string;
  readonly seatId: number;
  readonly createdAt: Date;
}
