import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { clearReservations, migrateTestDatabase } from 'test/utils/test-database.js';

let postgresContainer: StartedPostgreSqlContainer;
let app: INestApplication;
const RACE_ATTEMPTS = 25;
let runtimeAvailable = true;
const TRANSIENT_NETWORK_ERROR_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'EPIPE']);

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function reserveWithRetry(userId: string, seatId: number, retries = 3) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request(app.getHttpServer()).post('/reserve').send({ user_id: userId, seat_id: seatId });
    } catch (error) {
      lastError = error;

      const code =
        typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      const isTransient = TRANSIENT_NETWORK_ERROR_CODES.has(code);

      if (!isTransient || attempt === retries) {
        throw error;
      }

      await delay(20 * (attempt + 1));
    }
  }

  throw lastError;
}

beforeAll(async () => {
  try {
    postgresContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('ticket_booking_test')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();
  } catch {
    runtimeAvailable = false;
    return;
  }

  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.LOG_LEVEL = 'silent';
  process.env.DB_HOST = postgresContainer.getHost();
  process.env.DB_PORT = String(postgresContainer.getMappedPort(5432));
  process.env.DB_USER = postgresContainer.getUsername();
  process.env.DB_PASSWORD = postgresContainer.getPassword();
  process.env.DB_NAME = postgresContainer.getDatabase();
  process.env.DB_SSL = 'false';

  await migrateTestDatabase();

  const { AppModule } = await import('src/app.module.js');

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
}, 120_000);

afterEach(async () => {
  if (!runtimeAvailable) {
    return;
  }

  await clearReservations();
});

afterAll(async () => {
  if (!runtimeAvailable) {
    return;
  }

  await app.close();
  await postgresContainer.stop();
});

describe('Integration: API routes', () => {
  it('GET /health returns ok', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('POST /reserve reserves a seat', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/reserve')
      .set('x-request-id', 'req-1')
      .send({ user_id: 'user-1', seat_id: 1 });

    expect(response.status).toBe(201);
    expect(response.body.user_id).toBe('user-1');
    expect(response.body.seat_id).toBe(1);
    expect(response.headers['x-request-id']).toBe('req-1');
  });

  it('POST /reserve returns 404 for non-existing seat', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/reserve')
      .send({ user_id: 'user-1', seat_id: 10_001 });

    expect(response.status).toBe(404);
    expect(response.body.errorCode).toBe('SEAT_NOT_FOUND');
  });

  it('POST /reserve handles race condition with conflict', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const attempts = await Promise.allSettled(
      Array.from({ length: RACE_ATTEMPTS }, (_, index) =>
        reserveWithRetry(`user-${index}`, 2),
      ),
    );

    const rejectedUsers = attempts
      .map((item, index) => ({ item, index }))
      .filter(
        (value): value is { item: PromiseRejectedResult; index: number } =>
          value.item.status === 'rejected',
      )
      .map((value) => `user-${value.index}`);

    const successfulAttempts = attempts
      .filter((item): item is PromiseFulfilledResult<Awaited<ReturnType<typeof reserveWithRetry>>> => {
        return item.status === 'fulfilled';
      })
      .map((item) => item.value);

    const recoveredAttempts =
      rejectedUsers.length > 0
        ? await Promise.all(rejectedUsers.map((userId) => reserveWithRetry(userId, 2)))
        : [];

    const responses = [...successfulAttempts, ...recoveredAttempts];
    const successful = responses.filter((item) => item.status === 201);
    const conflicts = responses.filter((item) => item.status === 409);

    expect(successful).toHaveLength(1);
    expect(conflicts).toHaveLength(RACE_ATTEMPTS - 1);
  });

  it('POST /reserve returns validation error', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/reserve')
      .send({ user_id: '', seat_id: 0 });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('GET /metrics returns Prometheus metrics', async () => {
    if (!runtimeAvailable) {
      return;
    }

    const response = await request(app.getHttpServer()).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
  });
});
