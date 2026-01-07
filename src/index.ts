import { app } from "./app";
import { config } from "./config";
import { prisma } from "./utils/prisma";

const server = app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

const shutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
