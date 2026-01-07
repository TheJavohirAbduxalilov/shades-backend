import type { Request, Response, NextFunction } from "express";
import { login, getCurrentUser } from "../services/auth.service";
import { ApiError } from "../utils/api-error";

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const result = await login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = (_req: Request, res: Response) => {
  res.json({ ok: true });
};

export const meHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getCurrentUser(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
