import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/api-error";
import { signToken } from "../utils/jwt";
import { verifyPassword } from "../utils/password";
import type { AuthUser } from "../types";

export const login = async (username: string, password: string): Promise<{ user: AuthUser; token: string }> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullName: true,
      preferredLanguageCode: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken({ userId: user.id, username: user.username });

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      preferredLanguageCode: user.preferredLanguageCode as AuthUser["preferredLanguageCode"],
    },
    token,
  };
};

export const getCurrentUser = async (userId: number): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      preferredLanguageCode: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    preferredLanguageCode: user.preferredLanguageCode as AuthUser["preferredLanguageCode"],
  };
};
