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

test("order create supports no-price and post-only", async () => {
  const client = new FakeClient();
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
      "--post-only"
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
      expiration_ts: undefined,
      client_order_id: undefined
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
