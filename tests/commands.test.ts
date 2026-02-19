import test from "node:test";
import assert from "node:assert/strict";
import { runCommand } from "../src/commands";

class FakeClient {
  public lastRequest: unknown;

  async request(payload: unknown): Promise<unknown> {
    this.lastRequest = payload;
    return { ok: true };
  }
}

test("markets list maps query params", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["markets", "list", "--series", "CPI", "--status", "open"]);
  assert.deepEqual(client.lastRequest, {
    method: "GET",
    path: "/markets",
    query: { series_ticker: "CPI", status: "open", event_ticker: undefined }
  });
});

test("orders list defaults to resting status", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["orders", "list"]);
  assert.deepEqual(client.lastRequest, {
    method: "GET",
    path: "/portfolio/orders",
    query: { status: "resting", ticker: undefined, limit: undefined, cursor: undefined }
  });
});

test("settlements maps to portfolio settlements endpoint", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["settlements", "--limit", "50"]);
  assert.deepEqual(client.lastRequest, {
    method: "GET",
    path: "/portfolio/settlements",
    query: { limit: 50, cursor: undefined }
  });
});

test("series list maps to series collection endpoint", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["series", "list", "--limit", "20"]);
  assert.deepEqual(client.lastRequest, {
    method: "GET",
    path: "/series",
    query: { limit: 20, cursor: undefined }
  });
});

test("order create supports no-price and post-only", async () => {
  const client = new FakeClient();
  const futureTs = `${Date.now() + 3600_000}`;
  await runCommand(
    { client: client as never },
    [
      "order",
      "create",
      "--ticker",
      "CPI-24DEC-T3.0",
      "--side",
      "no",
      "--action",
      "buy",
      "--count",
      "10",
      "--no-price",
      "53",
      "--post-only",
      "--expiration-ts",
      futureTs,
      "--buy-max-cost",
      "530"
    ]
  );

  assert.deepEqual(client.lastRequest, {
    method: "POST",
    path: "/portfolio/orders",
    body: {
      ticker: "CPI-24DEC-T3.0",
      side: "NO",
      action: "BUY",
      count: 10,
      type: "LIMIT",
      yes_price: undefined,
      no_price: 53,
      post_only: true,
      expiration_ts: futureTs,
      client_order_id: undefined
    }
  });
});

test("order create rejects expired expiration-ts", async () => {
  const client = new FakeClient();
  await assert.rejects(
    runCommand(
      { client: client as never },
      [
        "order",
        "create",
        "--ticker",
        "CPI-24DEC-T3.0",
        "--side",
        "yes",
        "--action",
        "buy",
        "--count",
        "1",
        "--yes-price",
        "50",
        "--expiration-ts",
        "1"
      ]
    ),
    /must be in the future/
  );
});

test("order create rejects buy-max-cost overflow", async () => {
  const client = new FakeClient();
  await assert.rejects(
    runCommand(
      { client: client as never },
      [
        "order",
        "create",
        "--ticker",
        "CPI-24DEC-T3.0",
        "--side",
        "yes",
        "--action",
        "buy",
        "--count",
        "10",
        "--yes-price",
        "60",
        "--buy-max-cost",
        "500"
      ]
    ),
    /exceeds --buy-max-cost/
  );
});

test("order amend uses amend endpoint", async () => {
  const client = new FakeClient();
  await runCommand(
    { client: client as never },
    ["order", "amend", "abc123", "--yes-price", "44", "--count", "3", "--post-only"]
  );

  assert.deepEqual(client.lastRequest, {
    method: "POST",
    path: "/portfolio/orders/abc123/amend",
    body: {
      count: 3,
      yes_price: 44,
      no_price: undefined,
      post_only: true,
      expiration_ts: undefined
    }
  });
});

test("order cancel uses delete path", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["order", "cancel", "abc123"]);
  assert.deepEqual(client.lastRequest, {
    method: "DELETE",
    path: "/portfolio/orders/abc123"
  });
});
