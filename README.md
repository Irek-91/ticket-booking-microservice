# Ticket Booking Microservice

Микросервис бронирования билетов на NestJS + TypeScript с защитой от гонок при массовых одновременных запросах

## Что реализовано

- Endpoint `POST /reserve` принимает `user_id` и `seat_id`
- Одно место может быть забронировано только один раз за счет уникального ограничения `reservations.seat_id` и атомарного `INSERT ... ON CONFLICT DO NOTHING`
- Endpoint `GET /health` для health check
- Endpoint `GET /metrics` для Prometheus метрик
- Swagger доступен по `GET /docs`
- Добавлены `x-request-id`, централизованный exception filter и предсказуемый формат ошибок

## Почему PostgreSQL

PostgreSQL выбран вместо Redis, потому что для этого сценария важны строгая консистентность и гарантия уникальности на уровне БД при высокой конкурентности
Уникальный индекс + атомарная вставка надежно закрывают race condition без внешних распределенных блокировок

## Запуск проекта

1. Установить зависимости

```bash
npm install
```

2. Скопировать переменные окружения

```bash
cp .env.example .env
```

3. Поднять PostgreSQL через docker-compose

```bash
docker compose up -d postgres
```

4. Запустить сервис

```bash
npm run dev
```

При старте приложения миграции применяются автоматически, включая создание таблиц и сидирование мест
Команду `npm run db:migrate` можно использовать отдельно для ручного прогона миграций

## Запуск тестов

- Все тесты

```bash
npm test
```

- Unit тесты

```bash
npm run test:unit
```

- Integration тесты

```bash
npm run test:integration
```

## Как устроены тесты

- Unit тесты проверяют бизнес-логику use case `ReserveSeatUseCase` и ключевые ошибки
- Integration тесты поднимают реальный PostgreSQL через Testcontainers и проверяют все HTTP роуты: `POST /reserve`, `GET /health`, `GET /metrics`
- В integration тестах отдельно проверяется race condition: при параллельных запросах на одно место успешным остается только один

## Локальный запуск в Docker

```bash
docker compose up --build
```
