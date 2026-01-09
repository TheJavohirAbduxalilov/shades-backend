import type { Request, Response, NextFunction } from "express";
import * as ordersService from "../services/orders.service";
import { companyInfoTranslations } from "../config/company";
import { resolveLanguageCode } from "../utils/language";
import { ApiError } from "../utils/api-error";
import type { OrderStatusApi } from "../types";

const STATUS_FILTERS: OrderStatusApi[] = ["new", "in_progress", "measured", "completed"];

const parseStatusFilters = (value?: string): OrderStatusApi[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((status) => status.trim().toLowerCase())
    .filter((status): status is OrderStatusApi => STATUS_FILTERS.includes(status as OrderStatusApi));
};

const parseAssignedUserId = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getOrdersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const lang = resolveLanguageCode(req.query.lang);
    const statusValue = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const assignedUserId = parseAssignedUserId(req.query.assignedUserId);

    if (req.user.role === "ADMIN") {
      const orders = await ordersService.getAllOrders({
        lang,
        status: statusValue,
        assignedUserId,
        search,
      });

      res.json({ orders });
      return;
    }

    const statusFilters = parseStatusFilters(statusValue);
    const orders = await ordersService.listOrders({
      statusFilters,
      search,
      lang,
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = Number(req.params.id);
    const lang = resolveLanguageCode(req.query.lang);

    const order = await ordersService.getOrder(orderId, lang);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = Number(req.params.id);
    const lang = resolveLanguageCode(req.query.lang);
    const status = req.body.status as OrderStatusApi;

    const updated = await ordersService.updateOrderStatus(orderId, status, lang);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getOrderByTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingCode } = req.params;
    const lang = resolveLanguageCode(req.query.lang);

    const order = await ordersService.getOrderByTrackingCode(trackingCode, lang);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const companyInfo = companyInfoTranslations[lang] ?? companyInfoTranslations.ru;

    res.json({ order, companyInfo });
  } catch (error) {
    next(error);
  }
};

const ensureAdmin = (req: Request) => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden");
  }
};

export const createOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdmin(req);
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdmin(req);
    const orderId = Number(req.params.id);
    const order = await ordersService.updateOrder(orderId, req.body);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdmin(req);
    const orderId = Number(req.params.id);
    await ordersService.deleteOrder(orderId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const completeOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdmin(req);
    const orderId = Number(req.params.id);
    const order = await ordersService.completeOrder(orderId);
    res.json(order);
  } catch (error) {
    next(error);
  }
};
