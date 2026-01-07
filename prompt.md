Создай backend для PWA приложения замерщиков жалюзи.

## Технологический стек

- Node.js + Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- JWT аутентификация
- Bcrypt для хеширования паролей

## Структура проекта
shades-backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── config/
│   │   └── index.ts             # Environment variables
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── windows.routes.ts
│   │   ├── shades.routes.ts
│   │   └── catalog.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── windows.controller.ts
│   │   ├── shades.controller.ts
│   │   └── catalog.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── error.middleware.ts  # Global error handler
│   │   └── validate.middleware.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── orders.service.ts
│   │   ├── windows.service.ts
│   │   ├── shades.service.ts
│   │   ├── catalog.service.ts
│   │   └── price.service.ts     # Расчёт цен
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  # Seed data
├── package.json
├── tsconfig.json
├── .env.example
└── README.md

## Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Языки
model Language {
  code      String  @id @db.VarChar(10)
  name      String  @db.VarChar(50)
  isDefault Boolean @default(false) @map("is_default")

  users                       User[]
  shadeTypeTranslations       ShadeTypeTranslation[]
  optionTypeTranslations      OptionTypeTranslation[]
  optionValueTranslations     OptionValueTranslation[]
  materialTranslations        MaterialTranslation[]
  materialVariantTranslations MaterialVariantTranslation[]
  servicePriceTranslations    ServicePriceTranslation[]
  orderStatusTranslations     OrderStatusTranslation[]

  @@map("languages")
}

// Пользователи
model User {
  id                    Int      @id @default(autoincrement())
  username              String   @unique @db.VarChar(50)
  passwordHash          String   @map("password_hash") @db.VarChar(255)
  fullName              String   @map("full_name") @db.VarChar(100)
  preferredLanguageCode String   @default("ru") @map("preferred_language_code") @db.VarChar(10)
  createdAt             DateTime @default(now()) @map("created_at")

  preferredLanguage Language @relation(fields: [preferredLanguageCode], references: [code])
  orders            Order[]

  @@map("users")
}

// Заказы
model Order {
  id             Int         @id @default(autoincrement())
  clientName     String      @map("client_name") @db.VarChar(100)
  clientPhone    String      @map("client_phone") @db.VarChar(20)
  clientAddress  String      @map("client_address") @db.VarChar(255)
  notes          String?     @db.Text
  visitDate      DateTime    @map("visit_date") @db.Date
  status         OrderStatus @default(NEW)
  assignedUserId Int?        @map("assigned_user_id")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  assignedUser User?    @relation(fields: [assignedUserId], references: [id], onDelete: SetNull)
  windows      Window[]

  @@map("orders")
}

enum OrderStatus {
  NEW          @map("new")
  IN_PROGRESS  @map("in_progress")
  MEASURED     @map("measured")
  COMPLETED    @map("completed")
}

// Окна
model Window {
  id        Int      @id @default(autoincrement())
  orderId   Int      @map("order_id")
  name      String   @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  order  Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  shades Shade[]

  @@map("windows")
}

// Жалюзи
model Shade {
  id                   Int      @id @default(autoincrement())
  windowId             Int      @map("window_id")
  shadeTypeId          Int      @map("shade_type_id")
  width                Decimal  @db.Decimal(10, 2)
  height               Decimal  @db.Decimal(10, 2)
  materialVariantId    Int      @map("material_variant_id")
  installationIncluded Boolean  @default(false) @map("installation_included")
  removalIncluded      Boolean  @default(false) @map("removal_included")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  window          Window          @relation(fields: [windowId], references: [id], onDelete: Cascade)
  shadeType       ShadeType       @relation(fields: [shadeTypeId], references: [id])
  materialVariant MaterialVariant @relation(fields: [materialVariantId], references: [id])
  options         ShadeOption[]

  @@map("shades")
}

// Выбранные параметры жалюзи
model ShadeOption {
  id            Int @id @default(autoincrement())
  shadeId       Int @map("shade_id")
  optionTypeId  Int @map("option_type_id")
  optionValueId Int @map("option_value_id")

  shade       Shade       @relation(fields: [shadeId], references: [id], onDelete: Cascade)
  optionType  OptionType  @relation(fields: [optionTypeId], references: [id])
  optionValue OptionValue @relation(fields: [optionValueId], references: [id])

  @@unique([shadeId, optionTypeId])
  @@map("shade_options")
}

// === СПРАВОЧНИКИ ===

// Типы жалюзи
model ShadeType {
  id        Int      @id @default(autoincrement())
  minPrice  Decimal  @map("min_price") @db.Decimal(12, 2)
  createdAt DateTime @default(now()) @map("created_at")

  translations ShadeTypeTranslation[]
  optionTypes  OptionType[]
  materials    ShadeTypeMaterial[]
  shades       Shade[]

  @@map("shade_types")
}

model ShadeTypeTranslation {
  id           Int    @id @default(autoincrement())
  shadeTypeId  Int    @map("shade_type_id")
  languageCode String @map("language_code") @db.VarChar(10)
  name         String @db.VarChar(100)

  shadeType ShadeType @relation(fields: [shadeTypeId], references: [id], onDelete: Cascade)
  language  Language  @relation(fields: [languageCode], references: [code])

  @@unique([shadeTypeId, languageCode])
  @@map("shade_type_translations")
}

// Типы параметров
model OptionType {
  id           Int @id @default(autoincrement())
  shadeTypeId  Int @map("shade_type_id")
  displayOrder Int @default(0) @map("display_order")

  shadeType    ShadeType               @relation(fields: [shadeTypeId], references: [id], onDelete: Cascade)
  translations OptionTypeTranslation[]
  values       OptionValue[]
  shadeOptions ShadeOption[]

  @@map("option_types")
}

model OptionTypeTranslation {
  id           Int    @id @default(autoincrement())
  optionTypeId Int    @map("option_type_id")
  languageCode String @map("language_code") @db.VarChar(10)
  name         String @db.VarChar(100)

  optionType OptionType @relation(fields: [optionTypeId], references: [id], onDelete: Cascade)
  language   Language   @relation(fields: [languageCode], references: [code])

  @@unique([optionTypeId, languageCode])
  @@map("option_type_translations")
}

// Значения параметров
model OptionValue {
  id           Int @id @default(autoincrement())
  optionTypeId Int @map("option_type_id")
  displayOrder Int @default(0) @map("display_order")

  optionType   OptionType               @relation(fields: [optionTypeId], references: [id], onDelete: Cascade)
  translations OptionValueTranslation[]
  shadeOptions ShadeOption[]

  @@map("option_values")
}

model OptionValueTranslation {
  id            Int    @id @default(autoincrement())
  optionValueId Int    @map("option_value_id")
  languageCode  String @map("language_code") @db.VarChar(10)
  name          String @db.VarChar(100)

  optionValue OptionValue @relation(fields: [optionValueId], references: [id], onDelete: Cascade)
  language    Language    @relation(fields: [languageCode], references: [code])

  @@unique([optionValueId, languageCode])
  @@map("option_value_translations")
}

// Материалы
model Material {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now()) @map("created_at")

  translations MaterialTranslation[]
  variants     MaterialVariant[]
  shadeTypes   ShadeTypeMaterial[]

  @@map("materials")
}

model MaterialTranslation {
  id           Int    @id @default(autoincrement())
  materialId   Int    @map("material_id")
  languageCode String @map("language_code") @db.VarChar(10)
  name         String @db.VarChar(100)

  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  language Language @relation(fields: [languageCode], references: [code])

  @@unique([materialId, languageCode])
  @@map("material_translations")
}

// Варианты материала (цвет + цена)
model MaterialVariant {
  id          Int     @id @default(autoincrement())
  materialId  Int     @map("material_id")
  colorHex    String? @map("color_hex") @db.VarChar(7)
  imageUrl    String? @map("image_url") @db.VarChar(255)
  pricePerSqm Decimal @map("price_per_sqm") @db.Decimal(12, 2)

  material     Material                     @relation(fields: [materialId], references: [id], onDelete: Cascade)
  translations MaterialVariantTranslation[]
  shades       Shade[]

  @@map("material_variants")
}

model MaterialVariantTranslation {
  id                Int    @id @default(autoincrement())
  materialVariantId Int    @map("material_variant_id")
  languageCode      String @map("language_code") @db.VarChar(10)
  colorName         String @map("color_name") @db.VarChar(100)

  materialVariant MaterialVariant @relation(fields: [materialVariantId], references: [id], onDelete: Cascade)
  language        Language        @relation(fields: [languageCode], references: [code])

  @@unique([materialVariantId, languageCode])
  @@map("material_variant_translations")
}

// Связь типов жалюзи и материалов
model ShadeTypeMaterial {
  shadeTypeId Int @map("shade_type_id")
  materialId  Int @map("material_id")

  shadeType ShadeType @relation(fields: [shadeTypeId], references: [id], onDelete: Cascade)
  material  Material  @relation(fields: [materialId], references: [id], onDelete: Cascade)

  @@id([shadeTypeId, materialId])
  @@map("shade_type_materials")
}

// Цены на услуги
model ServicePrice {
  id          Int         @id @default(autoincrement())
  serviceType ServiceType @unique @map("service_type")
  price       Decimal     @db.Decimal(12, 2)
  updatedAt   DateTime    @updatedAt @map("updated_at")

  translations ServicePriceTranslation[]

  @@map("service_prices")
}

enum ServiceType {
  INSTALLATION @map("installation")
  REMOVAL      @map("removal")
}

model ServicePriceTranslation {
  id             Int    @id @default(autoincrement())
  servicePriceId Int    @map("service_price_id")
  languageCode   String @map("language_code") @db.VarChar(10)
  name           String @db.VarChar(100)

  servicePrice ServicePrice @relation(fields: [servicePriceId], references: [id], onDelete: Cascade)
  language     Language     @relation(fields: [languageCode], references: [code])

  @@unique([servicePriceId, languageCode])
  @@map("service_price_translations")
}

// Переводы статусов заказа
model OrderStatusTranslation {
  id           Int         @id @default(autoincrement())
  status       OrderStatus
  languageCode String      @map("language_code") @db.VarChar(10)
  name         String      @db.VarChar(100)

  language Language @relation(fields: [languageCode], references: [code])

  @@unique([status, languageCode])
  @@map("order_status_translations")
}
```

## API Endpoints

### Auth
- `POST /api/auth/login` — { username, password } → { user, token }
- `POST /api/auth/logout` — инвалидация токена (опционально)
- `GET /api/auth/me` — текущий пользователь

### Orders
- `GET /api/orders` — список заказов (query: ?status=new,in_progress&search=текст)
- `GET /api/orders/:id` — детали заказа с окнами и жалюзи
- `PATCH /api/orders/:id` — обновить статус

### Windows
- `POST /api/orders/:orderId/windows` — создать окно
- `PATCH /api/windows/:id` — редактировать окно
- `DELETE /api/windows/:id` — удалить окно

### Shades
- `POST /api/windows/:windowId/shades` — создать жалюзи
- `PATCH /api/shades/:id` — редактировать жалюзи
- `DELETE /api/shades/:id` — удалить жалюзи

### Catalog
- `GET /api/catalog?lang=ru` — весь каталог с переводами

### Price
- `POST /api/price/calculate` — расчёт цены

## Request/Response форматы

### POST /api/auth/login
```json
// Request
{ "username": "installer1", "password": "123456" }

// Response
{
  "user": {
    "id": 1,
    "username": "installer1",
    "fullName": "Иван Петров",
    "preferredLanguageCode": "ru"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/orders?lang=ru
```json
{
  "orders": [
    {
      "id": 1,
      "clientName": "Алишер Каримов",
      "clientPhone": "+998901234567",
      "clientAddress": "ул. Навои 50, кв. 12",
      "notes": "Домофон 12",
      "visitDate": "2025-01-20",
      "status": "new",
      "statusName": "Новый",
      "windowCount": 3,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/orders/:id?lang=ru
```json
{
  "id": 1,
  "clientName": "Алишер Каримов",
  "clientPhone": "+998901234567",
  "clientAddress": "ул. Навои 50, кв. 12",
  "notes": "Домофон 12",
  "visitDate": "2025-01-20",
  "status": "new",
  "statusName": "Новый",
  "windows": [
    {
      "id": 1,
      "name": "Окно 1",
      "shade": {
        "id": 1,
        "shadeTypeId": 1,
        "shadeTypeName": "Горизонтальные",
        "width": 150,
        "height": 180,
        "materialVariantId": 1,
        "materialName": "Ткань",
        "colorName": "Белый",
        "options": [
          { "optionTypeId": 1, "optionTypeName": "Место установки", "optionValueId": 1, "optionValueName": "На створку" },
          { "optionTypeId": 2, "optionTypeName": "Сторона управления", "optionValueId": 3, "optionValueName": "Правая" }
        ],
        "installationIncluded": true,
        "removalIncluded": false,
        "calculatedPrice": 265000
      }
    }
  ],
  "totalPrice": 265000
}
```

### POST /api/windows/:windowId/shades
```json
// Request
{
  "shadeTypeId": 1,
  "width": 150,
  "height": 180,
  "materialVariantId": 1,
  "options": [
    { "optionTypeId": 1, "optionValueId": 1 },
    { "optionTypeId": 2, "optionValueId": 3 }
  ],
  "installationIncluded": true,
  "removalIncluded": false
}

// Response
{
  "id": 1,
  "windowId": 1,
  "shadeTypeId": 1,
  "width": 150,
  "height": 180,
  "materialVariantId": 1,
  "options": [...],
  "installationIncluded": true,
  "removalIncluded": false,
  "calculatedPrice": 265000
}
```

### GET /api/catalog?lang=ru
```json
{
  "shadeTypes": [
    {
      "id": 1,
      "name": "Горизонтальные",
      "minPrice": 100000,
      "optionTypes": [
        {
          "id": 1,
          "name": "Место установки",
          "displayOrder": 1,
          "values": [
            { "id": 1, "name": "На створку", "displayOrder": 1 },
            { "id": 2, "name": "На проем", "displayOrder": 2 }
          ]
        },
        {
          "id": 2,
          "name": "Сторона управления",
          "displayOrder": 2,
          "values": [
            { "id": 3, "name": "Правая", "displayOrder": 1 },
            { "id": 4, "name": "Левая", "displayOrder": 2 }
          ]
        }
      ],
      "materials": [1, 2, 3]
    },
    {
      "id": 2,
      "name": "Вертикальные",
      "minPrice": 120000,
      "optionTypes": [
        {
          "id": 3,
          "name": "Способ крепления",
          "displayOrder": 1,
          "values": [
            { "id": 5, "name": "Потолок", "displayOrder": 1 },
            { "id": 6, "name": "Стена", "displayOrder": 2 }
          ]
        },
        {
          "id": 4,
          "name": "Тип раздвижки",
          "displayOrder": 2,
          "values": [
            { "id": 7, "name": "К механизму управления", "displayOrder": 1 },
            { "id": 8, "name": "От центра в две стороны", "displayOrder": 2 },
            { "id": 9, "name": "От механизма управления", "displayOrder": 3 }
          ]
        }
      ],
      "materials": [1, 2]
    }
  ],
  "materials": [
    {
      "id": 1,
      "name": "Ткань",
      "variants": [
        { "id": 1, "colorName": "Белый", "colorHex": "#FFFFFF", "pricePerSqm": 80000 },
        { "id": 2, "colorName": "Бежевый", "colorHex": "#F5F5DC", "pricePerSqm": 85000 }
      ]
    },
    {
      "id": 2,
      "name": "Пластик",
      "variants": [
        { "id": 3, "colorName": "Белый", "colorHex": "#FFFFFF", "pricePerSqm": 60000 }
      ]
    },
    {
      "id": 3,
      "name": "Дерево",
      "variants": [
        { "id": 4, "colorName": "Натуральный дуб", "colorHex": "#D4A574", "pricePerSqm": 150000 }
      ]
    }
  ],
  "servicePrices": {
    "installation": { "price": 50000, "name": "Монтаж" },
    "removal": { "price": 30000, "name": "Демонтаж" }
  }
}
```

### POST /api/price/calculate
```json
// Request
{
  "shadeTypeId": 1,
  "width": 150,
  "height": 180,
  "materialVariantId": 1,
  "installationIncluded": true,
  "removalIncluded": false
}

// Response
{
  "area": 2.7,
  "basePrice": 216000,
  "minPrice": 100000,
  "priceBeforeServices": 216000,
  "installationPrice": 50000,
  "removalPrice": 0,
  "totalPrice": 266000,
  "breakdown": {
    "areaCalculation": "150 × 180 / 10000 = 2.7 м²",
    "basePriceCalculation": "2.7 м² × 80000 сум = 216000 сум",
    "minPriceApplied": false
  }
}
```

## Формула расчёта цены (price.service.ts)
```typescript
function calculatePrice(params: {
  shadeTypeId: number;
  width: number;      // см
  height: number;     // см
  materialVariantId: number;
  installationIncluded: boolean;
  removalIncluded: boolean;
}): PriceCalculation {
  // 1. Получить minPrice типа жалюзи
  // 2. Получить pricePerSqm варианта материала
  // 3. Получить цены услуг
  
  const area = (width * height) / 10000; // м²
  const basePrice = area * pricePerSqm;
  const priceBeforeServices = Math.max(basePrice, minPrice);
  
  let totalPrice = priceBeforeServices;
  if (installationIncluded) totalPrice += installationPrice;
  if (removalIncluded) totalPrice += removalPrice;
  
  return { area, basePrice, minPrice, priceBeforeServices, totalPrice, ... };
}
```

## Seed данные (prisma/seed.ts)

Создай seed файл с:
- 3 языка (ru, uz_cyrl, uz_latn)
- 2 пользователя (installer1, installer2, пароль: 123456)
- 2 типа жалюзи с переводами (Горизонтальные, Вертикальные)
- Параметры для каждого типа с переводами
- 3 материала с вариантами и переводами (Ткань, Пластик, Дерево)
- 5 тестовых заказов с разными статусами
- Цены услуг с переводами
- Переводы статусов заказов

## Конфигурация

### .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/shades"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development

### package.json
```json
{
  "name": "shades-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.x",
    "bcrypt": "^5.x",
    "cors": "^2.x",
    "express": "^4.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.x",
    "@types/cors": "^2.x",
    "@types/express": "^4.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/node": "^20.x",
    "prisma": "^5.x",
    "ts-node": "^10.x",
    "ts-node-dev": "^2.x",
    "typescript": "^5.x"
  }
}
```

## Деплой на Render.com

Проект будет задеплоен как:
- **Web Service:** `shades-backend`
- **Database:** `shades-db`
- **Region:** Frankfurt (EU Central)

Build Command:
npm install && npm run prisma:generate && npm run build

Start Command:
npm run prisma:migrate:deploy && npm start

## Важные требования

1. Все ответы API должны поддерживать query параметр `?lang=ru|uz_cyrl|uz_latn`
2. Если язык не указан — использовать `ru` по умолчанию
3. Все ошибки возвращать в формате `{ error: string, details?: any }`
4. Использовать Zod для валидации входных данных
5. JWT токен передаётся в заголовке `Authorization: Bearer <token>`
6. CORS настроить для localhost:5173 и production домена Vercel
7. Добавить health check endpoint `GET /api/health`
8. Логировать все запросы (method, url, status, time)