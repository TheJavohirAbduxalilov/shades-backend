import { Router } from "express";
import { z } from "zod";
import { getCatalogHandler } from "../controllers/catalog.controller";
import { validate } from "../middleware/validate.middleware";

export const catalogRoutes = Router();

const catalogQuerySchema = z.object({
  lang: z.string().optional(),
});

catalogRoutes.get("/catalog", validate({ query: catalogQuerySchema }), getCatalogHandler);
