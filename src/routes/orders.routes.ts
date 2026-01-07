import { Router } from "express";
import { z } from "zod";
import {
  listOrdersHandler,
  getOrderHandler,
  updateOrderStatusHandler,
} from "../controllers/orders.controller";
import { validate } from "../middleware/validate.middleware";

export const ordersRoutes = Router();

const statusEnum = z.enum(["new", "in_progress", "measured", "completed"]);

const listOrdersQuerySchema = z.object({
  status: z.preprocess((value) => {
    if (typeof value !== "string") {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, z.array(statusEnum)),
  search: z.string().optional(),
  lang: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const updateStatusSchema = z.object({
  status: statusEnum,
});

ordersRoutes.get("/orders", validate({ query: listOrdersQuerySchema }), listOrdersHandler);
ordersRoutes.get("/orders/:id", validate({ params: idParamSchema }), getOrderHandler);
ordersRoutes.patch(
  "/orders/:id",
  validate({ params: idParamSchema, body: updateStatusSchema }),
  updateOrderStatusHandler
);
