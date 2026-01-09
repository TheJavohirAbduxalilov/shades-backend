import { Router } from "express";
import { z } from "zod";
import * as ordersController from "../controllers/orders.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

export const ordersRoutes = Router();

const trackingCodeParamSchema = z.object({
  trackingCode: z.string().regex(/^[A-Za-z0-9]{8}$/),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const statusEnum = z.enum(["new", "in_progress", "measured", "completed"]);

const listOrdersQuerySchema = z.object({
  status: z.string().optional(),
  assignedUserId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  lang: z.string().optional(),
});

const dateSchema = z.preprocess((value) => {
  if (typeof value === "string" || value instanceof Date) {
    return new Date(value);
  }
  return value;
}, z.date());

const createOrderSchema = z.object({
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  clientAddress: z.string().min(1),
  notes: z.string().nullable().optional(),
  visitDate: dateSchema,
  assignedUserId: z.coerce.number().int().positive().optional(),
});

const updateOrderSchema = z.object({
  clientName: z.string().min(1).optional(),
  clientPhone: z.string().min(1).optional(),
  clientAddress: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  visitDate: dateSchema.optional(),
  assignedUserId: z.coerce.number().int().positive().optional(),
});

const updateStatusSchema = z.object({
  status: statusEnum,
});

ordersRoutes.get(
  "/track/:trackingCode",
  validate({ params: trackingCodeParamSchema, query: z.object({ lang: z.string().optional() }) }),
  ordersController.getOrderByTracking
);

ordersRoutes.get(
  "/",
  authMiddleware,
  validate({ query: listOrdersQuerySchema }),
  ordersController.getOrdersHandler
);

ordersRoutes.get(
  "/:id",
  authMiddleware,
  validate({ params: idParamSchema, query: z.object({ lang: z.string().optional() }) }),
  ordersController.getOrderHandler
);

ordersRoutes.post(
  "/",
  authMiddleware,
  validate({ body: createOrderSchema }),
  ordersController.createOrderHandler
);

ordersRoutes.put(
  "/:id",
  authMiddleware,
  validate({ params: idParamSchema, body: updateOrderSchema }),
  ordersController.updateOrderHandler
);

ordersRoutes.delete(
  "/:id",
  authMiddleware,
  validate({ params: idParamSchema }),
  ordersController.deleteOrderHandler
);

ordersRoutes.patch(
  "/:id/complete",
  authMiddleware,
  validate({ params: idParamSchema }),
  ordersController.completeOrderHandler
);

ordersRoutes.patch(
  "/:id/status",
  authMiddleware,
  validate({
    params: idParamSchema,
    body: updateStatusSchema,
    query: z.object({ lang: z.string().optional() }),
  }),
  ordersController.updateOrderStatusHandler
);
