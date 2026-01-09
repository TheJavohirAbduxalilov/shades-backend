import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { ordersRoutes } from "./orders.routes";
import { windowsRoutes } from "./windows.routes";
import { shadesRoutes } from "./shades.routes";
import { catalogRoutes } from "./catalog.routes";
import { priceRoutes } from "./price.routes";
import { usersRoutes } from "./users.routes";

export const router = Router();

router.use("/auth", authRoutes);

router.use("/orders", ordersRoutes);
router.use("/users", usersRoutes);
router.use(windowsRoutes);
router.use(shadesRoutes);
router.use(catalogRoutes);
router.use(priceRoutes);
