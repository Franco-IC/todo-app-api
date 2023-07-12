import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  generateAPIKey,
  getAPIKeyInfo,
  remainingDailyAPIKeys,
  resetKeysUsagesAndRemainingKeysCounter,
} from "./utils/APIKeysConfig.js";
import { APIKeyValidation } from "./middlewares/APIKeyValidation.js";
import AuthRouter from "./routes/auth.routes.js";
import TasksRouter from "./routes/tasks.routes.js";
import { home_JSON, PORT } from "./utils/config.js";
import { info, errorJSON } from "./utils/loggers.js";

const app = express();

// settings
app.set("json spaces", 2);

// Daily Cron Job, Executes at 00:00 GMT-3 (Buenos Aires)
resetKeysUsagesAndRemainingKeysCounter();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routers
app.use("/api/auth", APIKeyValidation, AuthRouter);
app.use("/api/tasks", APIKeyValidation, TasksRouter);

// Index
app.get("/", (req, res) => {
  res.json(home_JSON);
});
app.get("/api", (req, res) => {
  res.json(home_JSON);
});

// API Key Generator
app.get("/api/api_key", (req, res) => {
  try {
    if (remainingDailyAPIKeys > 0) {
      generateAPIKey(res);
    } else {
      throw new Error(
        "No more API Keys available for today. Limit resets at 00:00 GMT-3 (Buenos Aires)"
      );
    }
  } catch (error) {
    errorJSON(res, error.message);
  }
});

// API Key Info
app.get("/api/api_key/:key", (req, res) => {
  try {
    const { key } = req.params;

    if (!key.trim()) throw new Error("no API Key provided");

    getAPIKeyInfo(key.trim(), res);
  } catch (error) {
    errorJSON(res, error.message);
  }
});

const server = app.listen(PORT || 0, () => {
  info(`app on port: ${server.address().port}`);
});
