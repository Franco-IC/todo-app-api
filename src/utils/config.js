import "dotenv/config.js";

export const PORT = process.env.PORT;

export const DB_CONNECTION_OPTIONS = {
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  ssl: { rejectUnauthorized: false },
};

export const home_JSON = [
  {
    API: "learning SQL with MySQL",
  },
  {
    author: "Franco-IC",
  },
  {
    try: "sending a GET request to /api/api_key to get your API key",
  },
  {
    github: "https://github.com/Franco-IC",
  },
];
