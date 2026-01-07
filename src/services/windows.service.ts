import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/api-error";

export const createWindow = async (orderId: number, name: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return prisma.window.create({
    data: {
      orderId,
      name,
    },
    select: {
      id: true,
      orderId: true,
      name: true,
    },
  });
};

export const updateWindow = async (windowId: number, name: string) => {
  const existing = await prisma.window.findUnique({
    where: { id: windowId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Window not found");
  }

  return prisma.window.update({
    where: { id: windowId },
    data: { name },
    select: {
      id: true,
      orderId: true,
      name: true,
    },
  });
};

export const deleteWindow = async (windowId: number) => {
  const existing = await prisma.window.findUnique({
    where: { id: windowId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Window not found");
  }

  await prisma.window.delete({
    where: { id: windowId },
  });

  return { id: windowId };
};
