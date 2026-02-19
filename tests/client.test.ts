import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { KalshiClient } from "../src/client";

test("client sends signed headers when api key and private key are set", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 1024 });
  const pem = privateKey.export({ type: "pkcs1", format: "pem" }).toString();

  const calls: Array<{ url: string; headers: Record<string, string> }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), headers: (init?.headers as Record<string, string>) ?? {} });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  const client = new KalshiClient({
    env: "demo",
    baseUrl: "https://demo-api.kalshi.co/trade-api/v2",
    apiKey: "key123",
    privateKey: pem
  });

  await client.request({ method: "GET", path: "/markets", query: { status: "open" } });
  globalThis.fetch = originalFetch;

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/markets\?status=open$/);
  assert.equal(calls[0].headers["KALSHI-ACCESS-KEY"], "key123");
  assert.equal(typeof calls[0].headers["KALSHI-ACCESS-SIGNATURE"], "string");
});
