import { OrderStatus, ServiceType } from "@prisma/client";
import type { OrderStatusApi, ServiceTypeApi } from "../types";

const ORDER_STATUS_TO_API: Record<OrderStatus, OrderStatusApi> = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  MEASURED: "measured",
  COMPLETED: "completed",
};

const ORDER_STATUS_FROM_API: Record<OrderStatusApi, OrderStatus> = {
  new: "NEW",
  in_progress: "IN_PROGRESS",
  measured: "MEASURED",
  completed: "COMPLETED",
};

const SERVICE_TYPE_TO_API: Record<ServiceType, ServiceTypeApi> = {
  INSTALLATION: "installation",
  REMOVAL: "removal",
};

const SERVICE_TYPE_FROM_API: Record<ServiceTypeApi, ServiceType> = {
  installation: "INSTALLATION",
  removal: "REMOVAL",
};

export const orderStatusToApi = (status: OrderStatus): OrderStatusApi =>
  ORDER_STATUS_TO_API[status];

export const orderStatusFromApi = (status: OrderStatusApi): OrderStatus =>
  ORDER_STATUS_FROM_API[status];

export const serviceTypeToApi = (type: ServiceType): ServiceTypeApi =>
  SERVICE_TYPE_TO_API[type];

export const serviceTypeFromApi = (type: ServiceTypeApi): ServiceType =>
  SERVICE_TYPE_FROM_API[type];
