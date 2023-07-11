import "dotenv/config.js";
import { errorJSON } from "../utils/loggers.js";
import { MySQLPool } from "../db.js";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

export async function APIKeyValidation(req, res, next) {
  try {
    if (!req.headers["api_key"]) throw new Error("No API key provided");
    const providedAPIKey = req.headers["api_key"];
    const url = req.originalUrl.split("/");

    if (url.includes("auth") && providedAPIKey !== PRIVATE_KEY)
      throw new Error("Public API keys cannot access authentication routes");

    if (providedAPIKey === PRIVATE_KEY) {
      req.privilege = "PRIVATE";
      return next();
    }

    const [currentAPIKey] = await MySQLPool.query(
      "SELECT * FROM api_keys WHERE api_key = ?",
      [providedAPIKey]
    );

    if (currentAPIKey.length === 0) throw new Error("Invalid API key");
    if (currentAPIKey[0].usages === 0)
      throw new Error(
        "API key has no usages left. Max per day = 15. Resets at 00:00 GMT-3 (Buenos Aires)"
      );

    req.privilege = "PUBLIC";

    return next();
  } catch (error) {
    errorJSON(res, error.message, 403);
  }
}
