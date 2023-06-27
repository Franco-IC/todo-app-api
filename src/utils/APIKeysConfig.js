import { CronJob } from "cron";
import { v4 as uuidv4 } from "uuid";
import { MySQLPool } from "../db.js";
import { info, error } from "./loggers.js";

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
  const key = uuidv4();

  const [newAPIKey] = await MySQLPool.query(
    "INSERT INTO api_keys (api_key, usages) VALUES (?, ?)",
    [key, 15]
  );
  remainingDailyAPIKeys--;

  res.status(201).json({
    API_Key: key,
  });
}

export async function updateAPIKeyUsage(key) {
  const [updatedAPIKey] = await MySQLPool.query(
    "UPDATE api_keys SET usages = usages - 1 WHERE api_key = ?",
    [key]
  );
}
