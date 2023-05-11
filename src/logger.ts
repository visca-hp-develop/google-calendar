import { ZodError } from "zod";
import { LIBRARY_NAME } from "./constant";

type LogType = Extract<keyof Console, "error" | "warn" | "log">;

type ErrorType = Error | ZodError;

function flattenErrors(args: unknown) {
  if (typeof args !== "object") {
    return args;
  }

  const errorMap: Record<string, unknown> = { ...args };

  for (const key in errorMap) {
    if (key === "_errors") {
      const errors = errorMap[key];
      if (Array.isArray(errors)) {
        if (errors.length === 0) {
          delete errorMap[key];
        } else {
          return errors.join("\n");
        }
      }
    } else {
      errorMap[key] = flattenErrors(errorMap[key]);
    }
  }

  return errorMap;
}

const log = (type: LogType, err: ErrorType) => {
  let result: unknown = err.message;

  if (err instanceof ZodError) {
    result = flattenErrors(err.format());
  }

  console[type](LIBRARY_NAME, JSON.stringify(result, null, 2));
};

const error = (err: ErrorType) => log("error", err);

const warn = (err: ErrorType) => log("warn", err);

export default {
  error,
  warn,
};
