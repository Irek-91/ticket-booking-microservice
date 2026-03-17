import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { runMigrations } from '../migrator.js';
import { KyselyDatabaseService } from './kysely-database.service.js';

@Injectable()
export class DatabaseMigrationsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseMigrationsService.name);

  public constructor(
    @Inject(KyselyDatabaseService)
    private readonly databaseService: KyselyDatabaseService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await runMigrations(this.databaseService.db);
    this.logger.log('Database migrations are up to date');
  }
}
