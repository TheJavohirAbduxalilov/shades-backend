import { prisma } from "../config/database";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateTrackingCode = async (): Promise<string> => {
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i += 1) {
      const index = Math.floor(Math.random() * CHARACTERS.length);
      code += CHARACTERS.charAt(index);
    }

    const existing = await prisma.order.findUnique({
      where: { trackingCode: code },
      select: { id: true },
    });

    isUnique = !existing;
  }

  return code;
};


