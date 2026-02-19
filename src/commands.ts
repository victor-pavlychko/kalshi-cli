import { KalshiClient } from "./client";

export interface CliContext {
  client: KalshiClient;
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0 || index === args.length - 1) {
    return undefined;
  }
  return args[index + 1];
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function requireFlag(args: string[], flag: string): string {
  const value = readFlag(args, flag);
  if (!value) {
    throw new Error(`Missing required flag ${flag}`);
  }
  return value;
}

function readNumberFlag(args: string[], flag: string): number | undefined {
  const raw = readFlag(args, flag);
  return raw === undefined ? undefined : Number(raw);
}

function normalizeArgs(actionOrId: string | undefined, rest: string[]): string[] {
  return [actionOrId, ...rest].filter(Boolean) as string[];
}

export async function runCommand(context: CliContext, args: string[]): Promise<unknown> {
  const [resource, actionOrId, ...rest] = args;

  if (resource === "markets" && actionOrId === "list") {
    return context.client.request({
      method: "GET",
      path: "/markets",
      query: {
        series_ticker: readFlag(rest, "--series"),
        status: readFlag(rest, "--status") ?? "open",
        event_ticker: readFlag(rest, "--event")
      }
    });
  }

  if (resource === "orderbook") {
    if (!actionOrId) {
      throw new Error("Usage: kalshi orderbook <ticker>");
    }
    return context.client.request({
      method: "GET",
      path: `/markets/${actionOrId}/orderbook`
    });
  }

  if (resource === "balance") {
    return context.client.request({
      method: "GET",
      path: "/portfolio/balance"
    });
  }

  if (resource === "positions") {
    const normalized = normalizeArgs(actionOrId, rest);
    return context.client.request({
      method: "GET",
      path: "/portfolio/positions",
      query: {
        ticker: readFlag(normalized, "--ticker")
      }
    });
  }

  if (resource === "orders" && actionOrId === "list") {
    return context.client.request({
      method: "GET",
      path: "/portfolio/orders",
      query: {
        status: readFlag(rest, "--status") ?? "resting",
        ticker: readFlag(rest, "--ticker"),
        limit: readNumberFlag(rest, "--limit"),
        cursor: readFlag(rest, "--cursor")
      }
    });
  }

  if (resource === "fills") {
    const normalized = normalizeArgs(actionOrId, rest);
    return context.client.request({
      method: "GET",
      path: "/portfolio/fills",
      query: {
        limit: readNumberFlag(normalized, "--limit"),
        cursor: readFlag(normalized, "--cursor")
      }
    });
  }

  if (resource === "trades") {
    const normalized = normalizeArgs(actionOrId, rest);
    return context.client.request({
      method: "GET",
      path: "/markets/trades",
      query: {
        ticker: readFlag(normalized, "--ticker"),
        limit: readNumberFlag(normalized, "--limit")
      }
    });
  }

  if (resource === "series") {
    if (!actionOrId) {
      throw new Error("Usage: kalshi series <series_ticker>");
    }
    return context.client.request({
      method: "GET",
      path: `/series/${actionOrId}`
    });
  }

  if (resource === "event") {
    if (!actionOrId) {
      throw new Error("Usage: kalshi event <event_ticker>");
    }
    return context.client.request({
      method: "GET",
      path: `/events/${actionOrId}`
    });
  }

  if (resource === "order" && actionOrId === "create") {
    const ticker = requireFlag(rest, "--ticker");
    const side = requireFlag(rest, "--side").toUpperCase();
    const action = requireFlag(rest, "--action").toUpperCase();
    const count = Number(requireFlag(rest, "--count"));

    return context.client.request({
      method: "POST",
      path: "/portfolio/orders",
      body: {
        ticker,
        side,
        action,
        count,
        type: (readFlag(rest, "--type") ?? "limit").toUpperCase(),
        yes_price: readNumberFlag(rest, "--yes-price"),
        no_price: readNumberFlag(rest, "--no-price"),
        post_only: hasFlag(rest, "--post-only") || undefined,
        expiration_ts: readFlag(rest, "--expiration-ts"),
        client_order_id: readFlag(rest, "--client-order-id")
      }
    });
  }

  if (resource === "order" && actionOrId === "cancel") {
    const orderId = rest[0];
    if (!orderId) {
      throw new Error("Usage: kalshi order cancel <order_id>");
    }

    return context.client.request({
      method: "DELETE",
      path: `/portfolio/orders/${orderId}`
    });
  }

  throw new Error("Unknown command. Run `kalshi help` for usage.");
}
