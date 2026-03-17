import type { HttpStatus } from '@nestjs/common';

export class AppError extends Error {
  public readonly code: string;
  public readonly status: HttpStatus;
  public readonly details?: Record<string, unknown>;

  public constructor(
    message: string,
    code: string,
    status: HttpStatus,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
