import type { Request, Response, NextFunction } from "express";
import { createWindow, updateWindow, deleteWindow } from "../services/windows.service";

export const createWindowHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = Number(req.params.orderId);
    const { name } = req.body;

    const window = await createWindow(orderId, name);
    res.status(201).json(window);
  } catch (error) {
    next(error);
  }
};

export const updateWindowHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const windowId = Number(req.params.id);
    const { name } = req.body;

    const window = await updateWindow(windowId, name);
    res.json(window);
  } catch (error) {
    next(error);
  }
};

export const deleteWindowHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const windowId = Number(req.params.id);

    const result = await deleteWindow(windowId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
