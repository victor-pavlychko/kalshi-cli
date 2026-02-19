import { KalshiEnvironment } from "./types";

const PROD_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";
const DEMO_BASE_URL = "https://demo-api.kalshi.co/trade-api/v2";

export function resolveEnvironment(value?: string): KalshiEnvironment {
  if (value === "prod" || value === "demo") {
    return value;
  }

  const envValue = process.env.KALSHI_ENV;
  if (envValue === "prod" || envValue === "demo") {
    return envValue;
  }

  return "prod";
}

export function resolveBaseUrl(env: KalshiEnvironment): string {
  return process.env.KALSHI_BASE_URL ?? (env === "demo" ? DEMO_BASE_URL : PROD_BASE_URL);
}
