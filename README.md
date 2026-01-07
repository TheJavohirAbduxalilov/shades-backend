# Shades Backend

Backend для PWA приложения замерщиков жалюзи.

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` по примеру `.env.example`.

3. Применить миграции и сиды:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Запустить в dev-режиме:

```bash
npm run dev
```

## Полезные команды

- `npm run build` — сборка TypeScript
- `npm start` — запуск собранного приложения
- `npm run prisma:studio` — Prisma Studio
