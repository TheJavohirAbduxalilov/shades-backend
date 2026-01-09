import { Router } from "express";
import { z } from "zod";
import {
  createWindowHandler,
  updateWindowHandler,
  deleteWindowHandler,
} from "../controllers/windows.controller";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

export const windowsRoutes = Router();

windowsRoutes.use(authMiddleware);

const orderIdParamSchema = z.object({
  orderId: z.string().regex(/^\d+$/),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const windowBodySchema = z.object({
  name: z.string().min(1),
});

windowsRoutes.post(
  "/orders/:orderId/windows",
  validate({ params: orderIdParamSchema, body: windowBodySchema }),
  createWindowHandler
);

windowsRoutes.patch(
  "/windows/:id",
  validate({ params: idParamSchema, body: windowBodySchema }),
  updateWindowHandler
);

windowsRoutes.delete("/windows/:id", validate({ params: idParamSchema }), deleteWindowHandler);
