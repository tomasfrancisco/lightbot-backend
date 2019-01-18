export const IS_PRODUCTION =
  (process.env.NODE_ENV || "production").toLowerCase() === "production";

export const IS_TEST = (process.env.NODE_ENV || "production").toLowerCase() === "test";
