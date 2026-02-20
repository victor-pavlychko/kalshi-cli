#!/usr/bin/env node
import { runCommand } from "./commands";
import { resolveBaseUrl, resolveEnvironment } from "./config";
import { KalshiClient } from "./client";
import { resolvePrivateKey } from "./auth";

const HELP_TEXT = `kalshi - concise Kalshi CLI for automation

Usage:
  kalshi [--env prod|demo] [--pretty] <command>

Commands:
  markets list [--series <series_ticker>] [--status <status>] [--event <event_ticker>]
  orderbook <ticker>
  balance
  positions [--ticker <ticker>]
  orders list [--status <resting|executed|canceled>] [--ticker <ticker>] [--limit <n>] [--cursor <cursor>]
  settlements [--limit <n>] [--cursor <cursor>]
  fills [--limit <n>] [--cursor <cursor>]
  trades [--ticker <ticker>] [--limit <n>]
  series list [--limit <n>] [--cursor <cursor>]
  series <series_ticker>
  event <event_ticker>
  order create --ticker <ticker> --side <yes|no> --action <buy|sell> --count <n> [--type limit|market] [--yes-price <1-99>] [--no-price <1-99>] [--post-only] [--expiration-ts <unix_ms>] [--buy-max-cost <cents>] [--client-order-id <id>]
  order amend <order_id> [--count <n>] [--yes-price <1-99>] [--no-price <1-99>] [--post-only] [--expiration-ts <unix_ms>]
  order cancel <order_id>

Auth env vars:
  KALSHI_ACCESS_TOKEN
  or KALSHI_API_KEY + KALSHI_PRIVATE_KEY_BASE64

Config env vars:
  KALSHI_ENV=prod|demo
  KALSHI_BASE_URL=<override>
`;

function parseGlobalArgs(argv: string[]): { envArg?: string; pretty: boolean; command: string[] } {
  const args = [...argv];
  let envArg: string | undefined;
  let pretty = false;
  const command: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === "--env") {
      envArg = args[i + 1];
      i += 1;
      continue;
    }
    if (token === "--pretty") {
      pretty = true;
      continue;
    }
    command.push(token);
  }

  return { envArg, pretty, command };
}

async function main(): Promise<void> {
  const { envArg, pretty, command } = parseGlobalArgs(process.argv.slice(2));

  if (command.length === 0 || command[0] === "help" || command[0] === "--help") {
    process.stdout.write(`${HELP_TEXT}\n`);
    return;
  }

  const env = resolveEnvironment(envArg);
  const baseUrl = resolveBaseUrl(env);
  const client = new KalshiClient({
    env,
    baseUrl,
    accessToken: process.env.KALSHI_ACCESS_TOKEN,
    apiKey: process.env.KALSHI_API_KEY,
    privateKey: resolvePrivateKey(process.env.KALSHI_PRIVATE_KEY_BASE64)
  });

  const result = await runCommand({ client }, command);
  process.stdout.write(`${JSON.stringify(result, null, pretty ? 2 : 0)}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const details = (error as { details?: unknown }).details;
  const payload = details === undefined ? { error: message } : { error: message, details };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.exitCode = 1;
});
