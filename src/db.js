import { createPool } from "mysql2/promise.js";
import { DB_CONNECTION_OPTIONS } from "./utils/config.js";

export const MySQLPool = createPool(DB_CONNECTION_OPTIONS);
