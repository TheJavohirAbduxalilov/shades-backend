import { Router } from "express";
import { z } from "zod";
import { calculatePriceHandler } from "../controllers/price.controller";
import { validate } from "../middleware/validate.middleware";

export const priceRoutes = Router();

const priceSchema = z.object({
  shadeTypeId: z.coerce.number().int().positive(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  materialVariantId: z.coerce.number().int().positive(),
  installationIncluded: z.boolean(),
  removalIncluded: z.boolean(),
});

priceRoutes.post("/price/calculate", validate({ body: priceSchema }), calculatePriceHandler);
