import { randomUUID } from 'node:crypto';

import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { HEADER_X_REQUEST_ID } from 'src/shared/constants/app.constants.js';

import { RequestContextService } from '../request-context.service.js';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  public constructor(
    @Inject(RequestContextService)
    private readonly requestContextService: RequestContextService,
  ) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    const incomingRequestId = req.headers[HEADER_X_REQUEST_ID];
    const requestId =
      typeof incomingRequestId === 'string' && incomingRequestId.length > 0
        ? incomingRequestId
        : randomUUID();

    req.headers[HEADER_X_REQUEST_ID] = requestId;
    res.setHeader(HEADER_X_REQUEST_ID, requestId);

    if (this.requestContextService !== undefined) {
      this.requestContextService.run(requestId, next);
      return;
    }

    next();
  }
}
