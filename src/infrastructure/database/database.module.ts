import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DATABASE_CONFIG_KEY, type DatabaseConfig } from 'src/config/database.config.js';
import { RESERVATION_REPOSITORY } from 'src/domain/repositories/reservation.repository.js';

import { createKyselyDatabase } from './database.factory.js';
import { KYSELY_CONNECTION } from './database.tokens.js';
import { KyselyReservationRepository } from './repositories/kysely-reservation.repository.js';
import { DatabaseMigrationsService } from './services/database-migrations.service.js';
import { KyselyDatabaseService } from './services/kysely-database.service.js';

@Module({
  providers: [
    {
      provide: KYSELY_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.getOrThrow<DatabaseConfig>(DATABASE_CONFIG_KEY);
        return createKyselyDatabase(databaseConfig);
      },
    },
    KyselyDatabaseService,
    DatabaseMigrationsService,
    {
      provide: RESERVATION_REPOSITORY,
      useClass: KyselyReservationRepository,
    },
  ],
  exports: [KyselyDatabaseService, RESERVATION_REPOSITORY],
})
export class DatabaseModule {}
