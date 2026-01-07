import type { RequestHandler } from "express";
import { prisma } from "../utils/prisma";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/api-error";
import type { LanguageCode } from "../types";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        preferredLanguageCode: true,
      },
    });

    if (!user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      preferredLanguageCode: user.preferredLanguageCode as LanguageCode,
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};
