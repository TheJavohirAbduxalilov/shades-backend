import jwt from "jsonwebtoken";
import { config } from "../config";
import type { JwtPayload } from "../types";

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwtSecret) as JwtPayload;
