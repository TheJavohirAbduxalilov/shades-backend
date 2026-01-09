import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/api-error";
import { calculatePrice } from "./price.service";
import { generateTrackingCode } from "../utils/trackingCode";
import { orderStatusFromApi, orderStatusToApi } from "../utils/mappers";
import type { LanguageCode, OrderStatusApi } from "../types";

const formatDateOnly = (value: Date): string => value.toISOString().split("T")[0];

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

const getStatusNameMap = async (
  lang: LanguageCode,
  statuses: OrderStatus[]
): Promise<Map<OrderStatus, string>> => {
  if (statuses.length === 0) {
    return new Map();
  }

  const translations = await prisma.orderStatusTranslation.findMany({
    where: {
      languageCode: lang,
      status: { in: statuses },
    },
    select: {
      status: true,
      name: true,
    },
  });

  return new Map(translations.map((translation) => [translation.status, translation.name]));
};

const buildOrderDetailsInclude = (lang: LanguageCode) => ({
  windows: {
    include: {
      shades: {
        include: {
          shadeType: {
            include: {
              translations: {
                where: { languageCode: lang },
              },
            },
          },
          materialVariant: {
            include: {
              translations: {
                where: { languageCode: lang },
              },
              material: {
                include: {
                  translations: {
                    where: { languageCode: lang },
                  },
                },
              },
            },
          },
          options: {
            include: {
              optionType: {
                include: {
                  translations: {
                    where: { languageCode: lang },
                  },
                },
              },
              optionValue: {
                include: {
                  translations: {
                    where: { languageCode: lang },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: ReturnType<typeof buildOrderDetailsInclude>;
}>;

const formatOrderDetails = async (order: OrderWithDetails, lang: LanguageCode) => {
  const statusNameMap = await getStatusNameMap(lang, [order.status]);

  let totalPrice = 0;

  const windows = await Promise.all(
    order.windows.map(async (window) => {
      const shade = window.shades[0];
      if (!shade) {
        return { id: window.id, name: window.name, shade: null };
      }

      const calculated = await calculatePrice({
        shadeTypeId: shade.shadeTypeId,
        width: Number(shade.width),
        height: Number(shade.height),
        materialVariantId: shade.materialVariantId,
        installationIncluded: shade.installationIncluded,
        removalIncluded: shade.removalIncluded,
      });

      totalPrice += calculated.totalPrice;

      const shadeTypeName = shade.shadeType.translations[0]?.name ?? "";
      const materialName = shade.materialVariant.material.translations[0]?.name ?? "";
      const colorName = shade.materialVariant.translations[0]?.colorName ?? "";

      const options = shade.options.map((option) => ({
        optionTypeId: option.optionTypeId,
        optionTypeName: option.optionType.translations[0]?.name ?? "",
        optionValueId: option.optionValueId,
        optionValueName: option.optionValue.translations[0]?.name ?? "",
        displayOrder: option.optionType.displayOrder,
      }));

      options.sort((a, b) => a.displayOrder - b.displayOrder);

      return {
        id: window.id,
        name: window.name,
        shade: {
          id: shade.id,
          shadeTypeId: shade.shadeTypeId,
          shadeTypeName,
          width: Number(shade.width),
          height: Number(shade.height),
          materialVariantId: shade.materialVariantId,
          materialName,
          colorName,
          options: options.map(({ displayOrder, ...option }) => option),
          installationIncluded: shade.installationIncluded,
          removalIncluded: shade.removalIncluded,
          calculatedPrice: calculated.totalPrice,
        },
      };
    })
  );

  return {
    id: order.id,
    trackingCode: order.trackingCode,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientAddress: order.clientAddress,
    notes: order.notes,
    visitDate: formatDateOnly(order.visitDate),
    status: orderStatusToApi(order.status),
    statusName: statusNameMap.get(order.status) ?? orderStatusToApi(order.status),
    windows,
    totalPrice,
  };
};

export const listOrders = async (params: {
  statusFilters: OrderStatusApi[];
  search?: string;
  lang: LanguageCode;
}): Promise<
  Array<{
    id: number;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    notes: string | null;
    visitDate: string;
    status: OrderStatusApi;
    statusName: string;
    windowCount: number;
    createdAt: string;
  }>
> => {
  const { statusFilters, search, lang } = params;

  const where: Prisma.OrderWhereInput = {};

  if (statusFilters.length > 0) {
    where.status = { in: statusFilters.map((status) => orderStatusFromApi(status)) };
  }

  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { clientPhone: { contains: search, mode: "insensitive" } },
      { clientAddress: { contains: search, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { windows: true },
      },
    },
  });

  const statuses = Array.from(new Set(orders.map((order) => order.status)));
  const statusNameMap = await getStatusNameMap(lang, statuses);

  return orders.map((order) => ({
    id: order.id,
    trackingCode: order.trackingCode,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientAddress: order.clientAddress,
    notes: order.notes,
    visitDate: formatDateOnly(order.visitDate),
    status: orderStatusToApi(order.status),
    statusName: statusNameMap.get(order.status) ?? orderStatusToApi(order.status),
    windowCount: order._count.windows,
    createdAt: order.createdAt.toISOString(),
  }));
};

export const getOrder = async (orderId: number, lang: LanguageCode) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: buildOrderDetailsInclude(lang),
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return formatOrderDetails(order, lang);
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusApi,
  lang: LanguageCode
) => {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Order not found");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: orderStatusFromApi(status) },
    select: { id: true, status: true },
  });

  const statusNameMap = await getStatusNameMap(lang, [updated.status]);

  return {
    id: updated.id,
    status: orderStatusToApi(updated.status),
    statusName: statusNameMap.get(updated.status) ?? orderStatusToApi(updated.status),
  };
};

export const getAllOrders = async (params: {
  lang: LanguageCode;
  status?: string;
  assignedUserId?: number;
  search?: string;
}) => {
  const { lang, status, assignedUserId, search } = params;

  const where: Prisma.OrderWhereInput = {};
  const statusFilters = parseStatusFilters(status);

  if (statusFilters.length > 0) {
    where.status = { in: statusFilters.map((item) => orderStatusFromApi(item)) };
  }

  if (assignedUserId) {
    where.assignedUserId = assignedUserId;
  }

  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { clientAddress: { contains: search, mode: "insensitive" } },
      { clientPhone: { contains: search } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      windows: true,
      assignedUser: {
        select: { id: true, username: true, fullName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = Array.from(new Set(orders.map((order) => order.status)));
  const statusNameMap = await getStatusNameMap(lang, statuses);

  return orders.map((order) => ({
    id: order.id,
    trackingCode: order.trackingCode,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientAddress: order.clientAddress,
    notes: order.notes,
    visitDate: formatDateOnly(order.visitDate),
    status: orderStatusToApi(order.status),
    statusName: statusNameMap.get(order.status) ?? orderStatusToApi(order.status),
    assignedUser: order.assignedUser
      ? {
          id: order.assignedUser.id,
          username: order.assignedUser.username,
          fullName: order.assignedUser.fullName,
        }
      : null,
    windowCount: order.windows.length,
    createdAt: order.createdAt.toISOString(),
  }));
};

export const getOrderByTrackingCode = async (trackingCode: string, lang: LanguageCode) => {
  const normalizedCode = trackingCode.toUpperCase();

  const order = await prisma.order.findUnique({
    where: { trackingCode: normalizedCode },
    include: buildOrderDetailsInclude(lang),
  });

  if (!order) {
    return null;
  }

  return formatOrderDetails(order, lang);
};

export const createOrder = async (data: {
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  notes?: string;
  visitDate: Date;
  assignedUserId?: number;
}) => {
  const trackingCode = await generateTrackingCode();

  return prisma.order.create({
    data: {
      ...data,
      trackingCode,
      status: OrderStatus.NEW,
    },
  });
};

export const updateOrder = async (
  id: number,
  data: {
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    visitDate?: Date;
    assignedUserId?: number;
  }
) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status === "COMPLETED") {
    throw new ApiError(400, "Cannot edit completed order");
  }

  return prisma.order.update({
    where: { id },
    data,
  });
};

export const deleteOrder = async (id: number) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status === "COMPLETED") {
    throw new ApiError(400, "Cannot delete completed order");
  }

  return prisma.order.delete({ where: { id } });
};

export const completeOrder = async (id: number) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return prisma.order.update({
    where: { id },
    data: { status: OrderStatus.COMPLETED },
  });
};


