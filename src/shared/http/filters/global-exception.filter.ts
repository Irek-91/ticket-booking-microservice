import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

import { APP_ERROR_CODE } from 'src/shared/constants/app.constants.js';
import { AppError } from 'src/shared/errors/app-error.js';
import { RequestContextService } from 'src/shared/http/request-context.service.js';

interface ErrorResponse {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly message: string;
  readonly requestId: string | null;
  readonly timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(RequestContextService)
    private readonly requestContextService: RequestContextService,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status(code: number): { json(payload: ErrorResponse): void };
    }>();
    const requestId = this.requestContextService?.getRequestId() ?? null;

    if (exception instanceof AppError) {
      response.status(exception.status).json({
        statusCode: exception.status,
        errorCode: exception.code,
        message: exception.message,
        requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.resolveHttpExceptionMessage(exception, 'Request failed');

      response.status(status).json({
        statusCode: status,
        errorCode:
          status === HttpStatus.BAD_REQUEST
            ? APP_ERROR_CODE.VALIDATION_ERROR
            : APP_ERROR_CODE.INTERNAL_ERROR,
        message,
        requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.logger.error({ err: exception, requestId }, 'Unhandled error');

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: APP_ERROR_CODE.INTERNAL_ERROR,
      message: 'Internal server error',
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveHttpExceptionMessage(exception: HttpException, fallback: string): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = response.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join('; ');
      }
    }

    return fallback;
  }
}
