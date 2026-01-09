import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getInstallersHandler } from "../controllers/users.controller";

export const usersRoutes = Router();

usersRoutes.get("/installers", authMiddleware, getInstallersHandler);
