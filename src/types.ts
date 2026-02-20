export type HttpMethod = "GET" | "POST" | "DELETE";

export type KalshiEnvironment = "prod" | "demo";

export interface ClientConfig {
  env: KalshiEnvironment;
  baseUrl: string;
  apiKey?: string;
  privateKey?: string;
  accessToken?: string;
}

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}
