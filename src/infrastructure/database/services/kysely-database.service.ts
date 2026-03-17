import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type { Kysely } from 'kysely';

import type { DatabaseSchema } from '../db.types.js';
import { KYSELY_CONNECTION } from '../database.tokens.js';

@Injectable()
export class KyselyDatabaseService implements OnApplicationShutdown {
  public constructor(@Inject(KYSELY_CONNECTION) public readonly db: Kysely<DatabaseSchema>) {}

  public async onApplicationShutdown(): Promise<void> {
    await this.db.destroy();
  }
}
