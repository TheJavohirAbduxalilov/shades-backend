import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { ordersRoutes } from "./orders.routes";
import { windowsRoutes } from "./windows.routes";
import { shadesRoutes } from "./shades.routes";
import { catalogRoutes } from "./catalog.routes";
import { priceRoutes } from "./price.routes";
import { authMiddleware } from "../middleware/auth.middleware";

export const router = Router();

router.use("/auth", authRoutes);

router.use(authMiddleware);

router.use(ordersRoutes);
router.use(windowsRoutes);
router.use(shadesRoutes);
router.use(catalogRoutes);
router.use(priceRoutes);
