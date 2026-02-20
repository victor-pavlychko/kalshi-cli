import test from "node:test";
import assert from "node:assert/strict";
import { resolveBaseUrl, resolveEnvironment } from "../src/config";

test("resolveEnvironment defaults to prod", () => {
  delete process.env.KALSHI_ENV;
  assert.equal(resolveEnvironment(undefined), "prod");
});

test("resolveEnvironment uses explicit arg", () => {
  process.env.KALSHI_ENV = "prod";
  assert.equal(resolveEnvironment("demo"), "demo");
});

test("resolveBaseUrl supports override", () => {
  process.env.KALSHI_BASE_URL = "https://example.test";
  assert.equal(resolveBaseUrl("prod"), "https://example.test");
  delete process.env.KALSHI_BASE_URL;
});
