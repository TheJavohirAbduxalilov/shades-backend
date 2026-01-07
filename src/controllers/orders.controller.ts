import type { Request, Response, NextFunction } from "express";
import { listOrders, getOrder, updateOrderStatus } from "../services/orders.service";
import { resolveLanguageCode } from "../utils/language";
import type { OrderStatusApi } from "../types";

export const listOrdersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = resolveLanguageCode(req.query.lang);
    const statusFilters = Array.isArray(req.query.status)
      ? (req.query.status as OrderStatusApi[])
      : [];
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const orders = await listOrders({
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

    const order = await getOrder(orderId, lang);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = Number(req.params.id);
    const lang = resolveLanguageCode(req.query.lang);
    const status = req.body.status as OrderStatusApi;

    const updated = await updateOrderStatus(orderId, status, lang);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
