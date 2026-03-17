import { Inject, Injectable, NestInterceptor, type CallHandler, type ExecutionContext } from '@nestjs/common';
import { type Observable } from 'rxjs';

import { HEADER_X_REQUEST_ID } from 'src/shared/constants/app.constants.js';

import { RequestContextService } from '../request-context.service.js';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  public constructor(
    @Inject(RequestContextService)
    private readonly requestContextService: RequestContextService,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const requestId = this.requestContextService.getRequestId();

    if (requestId !== null) {
      response.setHeader(HEADER_X_REQUEST_ID, requestId);
    }

    return next.handle();
  }
}
