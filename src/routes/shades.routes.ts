import { Router } from "express";
import { z } from "zod";
import {
  createShadeHandler,
  updateShadeHandler,
  deleteShadeHandler,
} from "../controllers/shades.controller";
import { validate } from "../middleware/validate.middleware";

export const shadesRoutes = Router();

const windowIdParamSchema = z.object({
  windowId: z.string().regex(/^\d+$/),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const optionSchema = z.object({
  optionTypeId: z.coerce.number().int().positive(),
  optionValueId: z.coerce.number().int().positive(),
});

const createShadeSchema = z.object({
  shadeTypeId: z.coerce.number().int().positive(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  materialVariantId: z.coerce.number().int().positive(),
  options: z.array(optionSchema),
  installationIncluded: z.boolean(),
  removalIncluded: z.boolean(),
});

const updateShadeSchema = z.object({
  shadeTypeId: z.coerce.number().int().positive().optional(),
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  materialVariantId: z.coerce.number().int().positive().optional(),
  options: z.array(optionSchema).optional(),
  installationIncluded: z.boolean().optional(),
  removalIncluded: z.boolean().optional(),
});

shadesRoutes.post(
  "/windows/:windowId/shades",
  validate({ params: windowIdParamSchema, body: createShadeSchema }),
  createShadeHandler
);

shadesRoutes.patch(
  "/shades/:id",
  validate({ params: idParamSchema, body: updateShadeSchema }),
  updateShadeHandler
);

shadesRoutes.delete("/shades/:id", validate({ params: idParamSchema }), deleteShadeHandler);
