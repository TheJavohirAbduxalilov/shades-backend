import express from "express";
import cors from "cors";
import { config } from "./config";
import { router } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs.toFixed(1)}ms`;
    console.log(message);
  });
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

app.use(errorMiddleware);
