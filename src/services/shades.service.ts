import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/api-error";
import { calculatePrice } from "./price.service";

interface ShadeInput {
  shadeTypeId: number;
  width: number;
  height: number;
  materialVariantId: number;
  installationIncluded: boolean;
  removalIncluded: boolean;
  options: Array<{ optionTypeId: number; optionValueId: number }>;
}

interface ShadeUpdateInput {
  shadeTypeId?: number;
  width?: number;
  height?: number;
  materialVariantId?: number;
  installationIncluded?: boolean;
  removalIncluded?: boolean;
  options?: Array<{ optionTypeId: number; optionValueId: number }>;
}

export const createShade = async (windowId: number, input: ShadeInput) => {
  const window = await prisma.window.findUnique({
    where: { id: windowId },
    select: { id: true },
  });

  if (!window) {
    throw new ApiError(404, "Window not found");
  }

  const shade = await prisma.shade.create({
    data: {
      windowId,
      shadeTypeId: input.shadeTypeId,
      width: input.width,
      height: input.height,
      materialVariantId: input.materialVariantId,
      installationIncluded: input.installationIncluded,
      removalIncluded: input.removalIncluded,
      options: {
        create: input.options.map((option) => ({
          optionTypeId: option.optionTypeId,
          optionValueId: option.optionValueId,
        })),
      },
    },
    include: {
      options: true,
    },
  });

  const calculated = await calculatePrice({
    shadeTypeId: shade.shadeTypeId,
    width: Number(shade.width),
    height: Number(shade.height),
    materialVariantId: shade.materialVariantId,
    installationIncluded: shade.installationIncluded,
    removalIncluded: shade.removalIncluded,
  });

  return {
    id: shade.id,
    windowId: shade.windowId,
    shadeTypeId: shade.shadeTypeId,
    width: Number(shade.width),
    height: Number(shade.height),
    materialVariantId: shade.materialVariantId,
    options: shade.options.map((option) => ({
      optionTypeId: option.optionTypeId,
      optionValueId: option.optionValueId,
    })),
    installationIncluded: shade.installationIncluded,
    removalIncluded: shade.removalIncluded,
    calculatedPrice: calculated.totalPrice,
  };
};

export const updateShade = async (shadeId: number, input: ShadeUpdateInput) => {
  const existing = await prisma.shade.findUnique({
    where: { id: shadeId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Shade not found");
  }

  await prisma.$transaction(async (tx) => {
    if (input.options) {
      await tx.shadeOption.deleteMany({
        where: { shadeId },
      });

      if (input.options.length > 0) {
        await tx.shadeOption.createMany({
          data: input.options.map((option) => ({
            shadeId,
            optionTypeId: option.optionTypeId,
            optionValueId: option.optionValueId,
          })),
        });
      }
    }

    await tx.shade.update({
      where: { id: shadeId },
      data: {
        shadeTypeId: input.shadeTypeId,
        width: input.width,
        height: input.height,
        materialVariantId: input.materialVariantId,
        installationIncluded: input.installationIncluded,
        removalIncluded: input.removalIncluded,
      },
    });
  });

  const shade = await prisma.shade.findUnique({
    where: { id: shadeId },
    include: { options: true },
  });

  if (!shade) {
    throw new ApiError(404, "Shade not found");
  }

  const calculated = await calculatePrice({
    shadeTypeId: shade.shadeTypeId,
    width: Number(shade.width),
    height: Number(shade.height),
    materialVariantId: shade.materialVariantId,
    installationIncluded: shade.installationIncluded,
    removalIncluded: shade.removalIncluded,
  });

  return {
    id: shade.id,
    windowId: shade.windowId,
    shadeTypeId: shade.shadeTypeId,
    width: Number(shade.width),
    height: Number(shade.height),
    materialVariantId: shade.materialVariantId,
    options: shade.options.map((option) => ({
      optionTypeId: option.optionTypeId,
      optionValueId: option.optionValueId,
    })),
    installationIncluded: shade.installationIncluded,
    removalIncluded: shade.removalIncluded,
    calculatedPrice: calculated.totalPrice,
  };
};

export const deleteShade = async (shadeId: number) => {
  const existing = await prisma.shade.findUnique({
    where: { id: shadeId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Shade not found");
  }

  await prisma.shade.delete({ where: { id: shadeId } });

  return { id: shadeId };
};
