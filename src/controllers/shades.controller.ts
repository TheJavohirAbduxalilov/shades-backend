import type { Request, Response, NextFunction } from "express";
import { createShade, updateShade, deleteShade } from "../services/shades.service";

export const createShadeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const windowId = Number(req.params.windowId);
    const shade = await createShade(windowId, req.body);
    res.status(201).json(shade);
  } catch (error) {
    next(error);
  }
};

export const updateShadeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shadeId = Number(req.params.id);
    const shade = await updateShade(shadeId, req.body);
    res.json(shade);
  } catch (error) {
    next(error);
  }
};

export const deleteShadeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shadeId = Number(req.params.id);
    const result = await deleteShade(shadeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
