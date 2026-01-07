export type LanguageCode = "ru" | "uz_cyrl" | "uz_latn";

export type OrderStatusApi = "new" | "in_progress" | "measured" | "completed";

export type ServiceTypeApi = "installation" | "removal";

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  preferredLanguageCode: LanguageCode;
}

export interface PriceBreakdown {
  areaCalculation: string;
  basePriceCalculation: string;
  minPriceApplied: boolean;
}

export interface PriceCalculation {
  area: number;
  basePrice: number;
  minPrice: number;
  priceBeforeServices: number;
  installationPrice: number;
  removalPrice: number;
  totalPrice: number;
  breakdown: PriceBreakdown;
}
