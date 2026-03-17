import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

interface RequestContext {
  readonly requestId: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  public run(requestId: string, callback: () => void): void {
    this.storage.run({ requestId }, callback);
  }

  public getRequestId(): string | null {
    return this.storage.getStore()?.requestId ?? null;
  }
}
