import { createSign } from "node:crypto";
import { ClientConfig, RequestOptions } from "./types";

function buildQueryString(query: RequestOptions["query"]): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const encoded = params.toString();
  return encoded.length > 0 ? `?${encoded}` : "";
}

function signRequest(privateKey: string, timestamp: string, method: string, pathWithQuery: string): string {
  const payload = `${timestamp}${method.toUpperCase()}${pathWithQuery}`;
  const signer = createSign("RSA-SHA256");
  signer.update(payload);
  signer.end();
  return signer.sign(privateKey, "base64");
}

export class KalshiClient {
  constructor(private readonly config: ClientConfig) {}

  async request(options: RequestOptions): Promise<unknown> {
    const querySuffix = buildQueryString(options.query);
    const pathWithQuery = `${options.path}${querySuffix}`;
    const url = `${this.config.baseUrl}${pathWithQuery}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.config.accessToken) {
      headers.Authorization = `Bearer ${this.config.accessToken}`;
    }

    if (this.config.apiKey && this.config.privateKey) {
      const timestamp = Date.now().toString();
      headers["KALSHI-ACCESS-KEY"] = this.config.apiKey;
      headers["KALSHI-ACCESS-TIMESTAMP"] = timestamp;
      headers["KALSHI-ACCESS-SIGNATURE"] = signRequest(
        this.config.privateKey,
        timestamp,
        options.method,
        pathWithQuery
      );
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    const text = await response.text();
    const data = text.length === 0 ? {} : JSON.parse(text);

    if (!response.ok) {
      const error = new Error(`Kalshi API error (${response.status})`);
      (error as Error & { details?: unknown }).details = data;
      throw error;
    }

    return data;
  }
}
