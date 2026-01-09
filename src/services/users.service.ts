import { prisma } from "../config/database";

export const getInstallers = async () => {
  return prisma.user.findMany({
    where: { role: "INSTALLER" },
    select: {
      id: true,
      username: true,
      fullName: true,
    },
    orderBy: { fullName: "asc" },
  });
};

