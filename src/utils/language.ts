import type { LanguageCode } from "../types";

const SUPPORTED_LANGUAGES: LanguageCode[] = ["ru", "uz_cyrl", "uz_latn"];

export const resolveLanguageCode = (value: unknown): LanguageCode => {
  if (typeof value !== "string") {
    return "ru";
  }

  return SUPPORTED_LANGUAGES.includes(value as LanguageCode)
    ? (value as LanguageCode)
    : "ru";
};
