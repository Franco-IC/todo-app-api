export function info(...params) {
  if (process.env.NODE_ENV !== "test") {
    console.log(...params);
  }
}

export function error(...params) {
  if (process.env.NODE_ENV !== "test") {
    console.log(...params);
  }
}

export function errorJSON(res, errorMessage, resStatus = 400) {
  return res.status(resStatus).json({ error: `${errorMessage}` });
}
