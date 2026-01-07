import { Router } from "express";
import { z } from "zod";
import { loginHandler, logoutHandler, meHandler } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

export const authRoutes = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRoutes.post("/login", validate({ body: loginSchema }), loginHandler);

authRoutes.post("/logout", authMiddleware, logoutHandler);

authRoutes.get("/me", authMiddleware, meHandler);
