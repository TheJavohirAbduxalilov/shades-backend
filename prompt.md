Добавь функционал для администратора и клиентского отслеживания заказа.

## 1. Обнови Prisma Schema (prisma/schema.prisma)

Добавь поле role в модель User:

model User {
  id                    Int      @id @default(autoincrement())
  username              String   @unique @db.VarChar(50)
  passwordHash          String   @map("password_hash") @db.VarChar(255)
  fullName              String   @map("full_name") @db.VarChar(100)
  role                  UserRole @default(INSTALLER)
  preferredLanguageCode String   @default("ru") @map("preferred_language_code") @db.VarChar(10)
  createdAt             DateTime @default(now()) @map("created_at")

  preferredLanguage Language @relation(fields: [preferredLanguageCode], references: [code])
  orders            Order[]

  @@map("users")
}

enum UserRole {
  ADMIN     @map("admin")
  INSTALLER @map("installer")
}

Добавь поле trackingCode в модель Order:

model Order {
  id             Int         @id @default(autoincrement())
  trackingCode   String      @unique @map("tracking_code") @db.VarChar(8)
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

## 2. Создай миграцию

Создай файл prisma/migrations/20250109000000_add_role_and_tracking/migration.sql:

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'installer');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'installer';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "tracking_code" VARCHAR(8);

-- Заполни tracking_code для существующих заказов
UPDATE "orders" SET "tracking_code" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)) WHERE "tracking_code" IS NULL;

-- Сделай tracking_code обязательным и уникальным
ALTER TABLE "orders" ALTER COLUMN "tracking_code" SET NOT NULL;
CREATE UNIQUE INDEX "orders_tracking_code_key" ON "orders"("tracking_code");

## 3. Создай config для контактов компании

Создай src/config/company.ts:

export const companyInfo = {
  name: "Shades Uzbekistan",
  phone: "+998 90 123 45 67",
  workingHours: "Пн-Пт: 9:00-18:00"
};

// Переводы
export const companyInfoTranslations: Record<string, typeof companyInfo> = {
  ru: {
    name: "Shades Uzbekistan",
    phone: "+998 90 123 45 67",
    workingHours: "Пн-Пт: 9:00-18:00"
  },
  uz_cyrl: {
    name: "Shades Uzbekistan",
    phone: "+998 90 123 45 67",
    workingHours: "Ду-Жу: 9:00-18:00"
  },
  uz_latn: {
    name: "Shades Uzbekistan",
    phone: "+998 90 123 45 67",
    workingHours: "Du-Ju: 9:00-18:00"
  }
};

## 4. Утилита для генерации tracking code

Создай src/utils/trackingCode.ts:

import { prisma } from '../config/database';

export const generateTrackingCode = async (): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let isUnique = false;

  do {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existing = await prisma.order.findUnique({
      where: { trackingCode: code }
    });
    
    isUnique = !existing;
  } while (!isUnique);

  return code;
};

## 5. Обнови orders.service.ts

Добавь функции:

// Получить все заказы (для админа)
export const getAllOrders = async (params: {
  lang: string;
  status?: string;
  assignedUserId?: number;
  search?: string;
}) => {
  const { lang, status, assignedUserId, search } = params;
  
  const where: any = {};
  
  if (status) {
    where.status = { in: status.split(',').map(s => s.toUpperCase()) };
  }
  
  if (assignedUserId) {
    where.assignedUserId = assignedUserId;
  }
  
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: 'insensitive' } },
      { clientAddress: { contains: search, mode: 'insensitive' } },
      { clientPhone: { contains: search } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      windows: true,
      assignedUser: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // ... форматирование с переводами
  return orders;
};

// Получить заказ по tracking code (для клиента, без авторизации)
export const getOrderByTrackingCode = async (trackingCode: string, lang: string) => {
  const order = await prisma.order.findUnique({
    where: { trackingCode },
    include: {
      windows: {
        include: {
          shades: {
            include: {
              shadeType: { include: { translations: true } },
              materialVariant: { 
                include: { 
                  translations: true,
                  material: { include: { translations: true } }
                } 
              },
              options: {
                include: {
                  optionType: { include: { translations: true } },
                  optionValue: { include: { translations: true } },
                }
              }
            }
          }
        }
      },
    },
  });

  if (!order) return null;

  // Форматирование с переводами и расчётом цен
  // ...
  
  return formattedOrder;
};

// Создать заказ (для админа)
export const createOrder = async (data: {
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  notes?: string;
  visitDate: Date;
  assignedUserId?: number;
}) => {
  const trackingCode = await generateTrackingCode();
  
  const order = await prisma.order.create({
    data: {
      ...data,
      trackingCode,
      status: 'NEW',
    },
  });

  return order;
};

// Обновить заказ (для админа)
export const updateOrder = async (id: number, data: {
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  notes?: string;
  visitDate?: Date;
  assignedUserId?: number;
}) => {
  // Проверить что заказ не завершён
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error('Order not found');
  if (order.status === 'COMPLETED') throw new Error('Cannot edit completed order');

  return prisma.order.update({
    where: { id },
    data,
  });
};

// Удалить заказ (для админа)
export const deleteOrder = async (id: number) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error('Order not found');
  if (order.status === 'COMPLETED') throw new Error('Cannot delete completed order');

  return prisma.order.delete({ where: { id } });
};

// Завершить заказ (для админа)
export const completeOrder = async (id: number) => {
  return prisma.order.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });
};

## 6. Создай users.service.ts

Создай src/services/users.service.ts:

import { prisma } from '../config/database';

export const getInstallers = async () => {
  return prisma.user.findMany({
    where: { role: 'INSTALLER' },
    select: {
      id: true,
      username: true,
      fullName: true,
    },
    orderBy: { fullName: 'asc' },
  });
};

## 7. Обнови orders.controller.ts

Добавь новые контроллеры:

// GET /api/orders/track/:trackingCode (публичный, без авторизации)
export const getOrderByTracking = async (req: Request, res: Response) => {
  const { trackingCode } = req.params;
  const lang = (req.query.lang as string) || 'ru';

  const order = await ordersService.getOrderByTrackingCode(trackingCode, lang);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Добавить контакты компании
  const companyInfo = companyInfoTranslations[lang] || companyInfoTranslations['ru'];

  res.json({ order, companyInfo });
};

// POST /api/orders (только для админа)
export const createOrder = async (req: Request, res: Response) => {
  const user = req.user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const order = await ordersService.createOrder(req.body);
  res.status(201).json(order);
};

// PUT /api/orders/:id (только для админа)
export const updateOrder = async (req: Request, res: Response) => {
  const user = req.user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;
  
  try {
    const order = await ordersService.updateOrder(Number(id), req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/orders/:id (только для админа)
export const deleteOrder = async (req: Request, res: Response) => {
  const user = req.user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;
  
  try {
    await ordersService.deleteOrder(Number(id));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PATCH /api/orders/:id/complete (только для админа)
export const completeOrder = async (req: Request, res: Response) => {
  const user = req.user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;
  const order = await ordersService.completeOrder(Number(id));
  res.json(order);
};

## 8. Создай users.controller.ts

Создай src/controllers/users.controller.ts:

import { Request, Response } from 'express';
import * as usersService from '../services/users.service';

export const getInstallers = async (req: Request, res: Response) => {
  const installers = await usersService.getInstallers();
  res.json({ installers });
};

## 9. Обнови orders.routes.ts

import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Публичный роут (без авторизации)
router.get('/track/:trackingCode', ordersController.getOrderByTracking);

// Защищённые роуты
router.get('/', authMiddleware, ordersController.getOrders);
router.get('/:id', authMiddleware, ordersController.getOrderById);
router.post('/', authMiddleware, ordersController.createOrder);
router.put('/:id', authMiddleware, ordersController.updateOrder);
router.delete('/:id', authMiddleware, ordersController.deleteOrder);
router.patch('/:id/complete', authMiddleware, ordersController.completeOrder);
router.patch('/:id/status', authMiddleware, ordersController.updateOrderStatus);

export default router;

## 10. Создай users.routes.ts

Создай src/routes/users.routes.ts:

import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/installers', authMiddleware, usersController.getInstallers);

export default router;

## 11. Обнови src/routes/index.ts

import usersRoutes from './users.routes';

// Добавь:
router.use('/users', usersRoutes);

## 12. Обнови auth.service.ts

При логине возвращай role:

export const login = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  // ...
  
  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      preferredLanguageCode: user.preferredLanguageCode,
    },
    token,
  };
};

## 13. Обнови seed.ts

Добавь демо админа и обнови существующих пользователей:

// Админ
const admin = await prisma.user.upsert({
  where: { username: 'admin' },
  update: {},
  create: {
    username: 'admin',
    passwordHash: await bcrypt.hash('123456', 10),
    fullName: 'Администратор',
    role: 'ADMIN',
    preferredLanguageCode: 'ru',
  },
});

// Замерщики (обнови существующих, добавь role)
const installer1 = await prisma.user.upsert({
  where: { username: 'installer1' },
  update: { role: 'INSTALLER' },
  create: {
    username: 'installer1',
    passwordHash: await bcrypt.hash('123456', 10),
    fullName: 'Иван Петров',
    role: 'INSTALLER',
    preferredLanguageCode: 'ru',
  },
});

// При создании заказов добавь trackingCode:
const order1 = await prisma.order.create({
  data: {
    trackingCode: 'DEMO0001',
    clientName: 'Алишер Каримов',
    // ...
  },
});