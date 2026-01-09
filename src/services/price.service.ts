import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/api-error";
import type { PriceCalculation } from "../types";

const roundMoney = (value: number): number => Math.round(value);

const formatNumber = (value: number): string => {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

export const calculatePrice = async (params: {
  shadeTypeId: number;
  width: number;
  height: number;
  materialVariantId: number;
  installationIncluded: boolean;
  removalIncluded: boolean;
}): Promise<PriceCalculation> => {
  const { shadeTypeId, width, height, materialVariantId, installationIncluded, removalIncluded } = params;

  const [shadeType, materialVariant, servicePrices] = await Promise.all([
    prisma.shadeType.findUnique({
      where: { id: shadeTypeId },
      select: { minPrice: true },
    }),
    prisma.materialVariant.findUnique({
      where: { id: materialVariantId },
      select: { pricePerSqm: true },
    }),
    prisma.servicePrice.findMany({
      select: { serviceType: true, price: true },
    }),
  ]);

  if (!shadeType) {
    throw new ApiError(404, "Shade type not found");
  }

  if (!materialVariant) {
    throw new ApiError(404, "Material variant not found");
  }

  const installationService = servicePrices.find((item) => item.serviceType === "INSTALLATION");
  const removalService = servicePrices.find((item) => item.serviceType === "REMOVAL");

  if (!installationService || !removalService) {
    throw new ApiError(500, "Service prices are not configured");
  }

  const minPrice = roundMoney(Number(shadeType.minPrice));
  const pricePerSqm = Number(materialVariant.pricePerSqm);
  const area = (width * height) / 1000000;
  const basePrice = roundMoney(area * pricePerSqm);
  const priceBeforeServices = Math.max(basePrice, minPrice);

  const installationPrice = installationIncluded ? roundMoney(Number(installationService.price)) : 0;
  const removalPrice = removalIncluded ? roundMoney(Number(removalService.price)) : 0;
  const totalPrice = priceBeforeServices + installationPrice + removalPrice;

  const areaFormatted = formatNumber(area);

  return {
    area: Number(areaFormatted),
    basePrice,
    minPrice,
    priceBeforeServices,
    installationPrice,
    removalPrice,
    totalPrice,
    breakdown: {
      areaCalculation: `${width} x ${height} / 1000000 = ${areaFormatted} м²`,
      basePriceCalculation: `${areaFormatted} м² x ${formatNumber(pricePerSqm)} сум = ${formatNumber(
        basePrice
      )} сум`,
      minPriceApplied: basePrice < minPrice,
    },
  };
};
