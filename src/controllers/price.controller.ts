import type { Request, Response, NextFunction } from "express";
import { calculatePrice } from "../services/price.service";

export const calculatePriceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await calculatePrice(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
