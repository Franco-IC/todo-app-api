import { CronJob } from "cron";
import { v4 as uuidv4 } from "uuid";
import { MySQLPool } from "../db.js";
import { info, error, errorJSON } from "./loggers.js";

export let remainingDailyAPIKeys = 5;

// Resets all the API keys usages every day at 00:00 GMT-3 (Buenos Aires) and refreshes the API Key creation counter
export function resetKeysUsagesAndRemainingKeysCounter() {
  const job = new CronJob(
    "00 00 * * *",
    () => {
      MySQLPool.query("UPDATE api_keys SET usages = 15 WHERE usages <= 15")
        .then((res) => {
          if (res[0].affectedRows > 0) info("API Keys usages reseted.");
        })
        .catch((err) => {
          error(err.message);
        });

      remainingDailyAPIKeys = 5;
    },
    null,
    true,
    "America/Argentina/Buenos_Aires"
  );
}

export async function generateAPIKey(res) {
  try {
    const key = uuidv4();

    const [newAPIKey] = await MySQLPool.query(
      "INSERT INTO api_keys (api_key, usages) VALUES (?, ?)",
      [key, 15]
    );
    remainingDailyAPIKeys--;

    res.status(201).json({
      API_Key: key,
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function updateAPIKeyUsage(key) {
  try {
    const [updatedAPIKey] = await MySQLPool.query(
      "UPDATE api_keys SET usages = usages - 1 WHERE api_key = ?",
      [key]
    );
  } catch (error) {
    error(error.message);
  }
}

export async function getAPIKeyInfo(key, res) {
  try {
    const [APIKeyInfo] = await MySQLPool.query(
      "SELECT api_key, usages FROM api_keys WHERE api_key = ?",
      [key]
    );

    if (APIKeyInfo.length === 0) {
      throw new Error("API Key not found");
    }

    res.json({
      key: APIKeyInfo[0].api_key,
      usages_left: APIKeyInfo[0].usages,
    });
  } catch (error) {
    error.message === "API Key not found"
      ? errorJSON(res, error.message, 404)
      : errorJSON(res, error.message, 500);
  }
}
