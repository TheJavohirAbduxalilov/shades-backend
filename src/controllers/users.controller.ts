import type { Request, Response, NextFunction } from "express";
import * as usersService from "../services/users.service";

export const getInstallersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const installers = await usersService.getInstallers();
    res.json({ installers });
  } catch (error) {
    next(error);
  }
};
