import { prisma } from "../utils/prisma";
import { serviceTypeToApi } from "../utils/mappers";
import type { LanguageCode } from "../types";

export const getCatalog = async (lang: LanguageCode) => {
  const shadeTypes = await prisma.shadeType.findMany({
    include: {
      translations: {
        where: { languageCode: lang },
      },
      optionTypes: {
        include: {
          translations: {
            where: { languageCode: lang },
          },
          values: {
            include: {
              translations: {
                where: { languageCode: lang },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { displayOrder: "asc" },
      },
      materials: true,
    },
    orderBy: { id: "asc" },
  });

  const materials = await prisma.material.findMany({
    include: {
      translations: {
        where: { languageCode: lang },
      },
      variants: {
        include: {
          translations: {
            where: { languageCode: lang },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const servicePrices = await prisma.servicePrice.findMany({
    include: {
      translations: {
        where: { languageCode: lang },
      },
    },
  });

  const servicePriceMap: Record<string, { price: number; name: string }> = {};
  for (const servicePrice of servicePrices) {
    const key = serviceTypeToApi(servicePrice.serviceType);
    servicePriceMap[key] = {
      price: Number(servicePrice.price),
      name: servicePrice.translations[0]?.name ?? "",
    };
  }

  return {
    shadeTypes: shadeTypes.map((shadeType) => ({
      id: shadeType.id,
      name: shadeType.translations[0]?.name ?? "",
      minPrice: Number(shadeType.minPrice),
      optionTypes: shadeType.optionTypes.map((optionType) => ({
        id: optionType.id,
        name: optionType.translations[0]?.name ?? "",
        displayOrder: optionType.displayOrder,
        values: optionType.values.map((value) => ({
          id: value.id,
          name: value.translations[0]?.name ?? "",
          displayOrder: value.displayOrder,
        })),
      })),
      materials: shadeType.materials.map((item) => item.materialId),
    })),
    materials: materials.map((material) => ({
      id: material.id,
      name: material.translations[0]?.name ?? "",
      variants: material.variants.map((variant) => ({
        id: variant.id,
        colorName: variant.translations[0]?.colorName ?? "",
        colorHex: variant.colorHex,
        pricePerSqm: Number(variant.pricePerSqm),
      })),
    })),
    servicePrices: servicePriceMap,
  };
};
