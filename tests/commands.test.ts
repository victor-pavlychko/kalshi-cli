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

test("order cancel uses delete path", async () => {
  const client = new FakeClient();
  await runCommand({ client: client as never }, ["order", "cancel", "abc123"]);
  assert.deepEqual(client.lastRequest, {
    method: "DELETE",
    path: "/portfolio/orders/abc123"
  });
});
