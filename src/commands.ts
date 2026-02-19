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

function ensurePositiveInteger(value: number, flag: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }
}

function validateExpiration(expirationTs?: string): void {
  if (expirationTs === undefined) {
    return;
  }

  const expiration = Number(expirationTs);
  if (!Number.isInteger(expiration)) {
    throw new Error("--expiration-ts must be a unix timestamp in milliseconds");
  }

  if (expiration <= Date.now()) {
    throw new Error("--expiration-ts must be in the future");
  }
}

function deriveContractPrice(side: string, yesPrice?: number, noPrice?: number): number | undefined {
  if (side === "YES") {
    if (yesPrice !== undefined) {
      return yesPrice;
    }
    if (noPrice !== undefined) {
      return 100 - noPrice;
    }
  }

  if (side === "NO") {
    if (noPrice !== undefined) {
      return noPrice;
    }
    if (yesPrice !== undefined) {
      return 100 - yesPrice;
    }
  }

  return undefined;
}

function validateBuyMaxCost(args: string[], side: string, action: string, count: number, yesPrice?: number, noPrice?: number): void {
  const maxCost = readNumberFlag(args, "--buy-max-cost");
  if (maxCost === undefined) {
    return;
  }

  if (action !== "BUY") {
    throw new Error("--buy-max-cost is only valid when --action buy");
  }

  if (!Number.isFinite(maxCost) || maxCost <= 0) {
    throw new Error("--buy-max-cost must be a positive number of cents");
  }

  const contractPrice = deriveContractPrice(side, yesPrice, noPrice);
  if (contractPrice === undefined) {
    throw new Error("--buy-max-cost requires --yes-price or --no-price");
  }

  const estimatedCost = contractPrice * count;
  if (estimatedCost > maxCost) {
    throw new Error(`Order cost ${estimatedCost}c exceeds --buy-max-cost ${maxCost}c`);
  }
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

  if (resource === "settlements") {
    const normalized = normalizeArgs(actionOrId, rest);
    return context.client.request({
      method: "GET",
      path: "/portfolio/settlements",
      query: {
        limit: readNumberFlag(normalized, "--limit"),
        cursor: readFlag(normalized, "--cursor")
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

  if (resource === "series" && actionOrId === "list") {
    return context.client.request({
      method: "GET",
      path: "/series",
      query: {
        limit: readNumberFlag(rest, "--limit"),
        cursor: readFlag(rest, "--cursor")
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
    ensurePositiveInteger(count, "--count");

    const yesPrice = readNumberFlag(rest, "--yes-price");
    const noPrice = readNumberFlag(rest, "--no-price");
    const expirationTs = readFlag(rest, "--expiration-ts");

    validateExpiration(expirationTs);
    validateBuyMaxCost(rest, side, action, count, yesPrice, noPrice);

    return context.client.request({
      method: "POST",
      path: "/portfolio/orders",
      body: {
        ticker,
        side,
        action,
        count,
        type: (readFlag(rest, "--type") ?? "limit").toUpperCase(),
        yes_price: yesPrice,
        no_price: noPrice,
        post_only: hasFlag(rest, "--post-only") || undefined,
        expiration_ts: expirationTs,
        client_order_id: readFlag(rest, "--client-order-id")
      }
    });
  }

  if (resource === "order" && actionOrId === "amend") {
    const orderId = rest[0];
    if (!orderId) {
      throw new Error("Usage: kalshi order amend <order_id> [--count <n>] [--yes-price <1-99>] [--no-price <1-99>] [--post-only] [--expiration-ts <unix_ms>]");
    }

    const amendArgs = rest.slice(1);
    const expirationTs = readFlag(amendArgs, "--expiration-ts");
    validateExpiration(expirationTs);

    return context.client.request({
      method: "POST",
      path: `/portfolio/orders/${orderId}/amend`,
      body: {
        count: readNumberFlag(amendArgs, "--count"),
        yes_price: readNumberFlag(amendArgs, "--yes-price"),
        no_price: readNumberFlag(amendArgs, "--no-price"),
        post_only: hasFlag(amendArgs, "--post-only") || undefined,
        expiration_ts: expirationTs
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
