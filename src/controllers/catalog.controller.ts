import type { Request, Response, NextFunction } from "express";
import { getCatalog } from "../services/catalog.service";
import { resolveLanguageCode } from "../utils/language";

export const getCatalogHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = resolveLanguageCode(req.query.lang);
    const catalog = await getCatalog(lang);
    res.json(catalog);
  } catch (error) {
    next(error);
  }
};
