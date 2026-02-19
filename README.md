# kalshi-cli

A simple TypeScript command-line utility for interacting with the official Kalshi Trade API in automated workflows (including agentic workflows).

- No third-party runtime libraries (uses Node.js built-ins only).
- Supports both production and demo/sandbox environments.
- Machine-friendly JSON output by default.

## Requirements

- Node.js 18+
- npm

## Installation (local, no registry publishing)

From this repository:

```bash
npm install
npm run build
npm link
```

After linking, use the CLI as:

```bash
kalshi help
```

If you do not want global linking, run it directly:

```bash
npm run build
node dist/cli.js help
```

## Configuration

Authentication is environment-driven.

### Option A: Access token

- `KALSHI_ACCESS_TOKEN`

### Option B: Official Kalshi signed headers

- `KALSHI_API_KEY`
- `KALSHI_PRIVATE_KEY` (PEM)

When key + private key are provided, the CLI signs requests and sends:

- `KALSHI-ACCESS-KEY`
- `KALSHI-ACCESS-TIMESTAMP`
- `KALSHI-ACCESS-SIGNATURE`

## Environment selection

- `KALSHI_ENV=prod|demo`
- or `--env prod|demo`
- Optional override: `KALSHI_BASE_URL`

Default URLs:

- prod: `https://api.elections.kalshi.com/trade-api/v2`
- demo: `https://demo-api.kalshi.co/trade-api/v2`

## Build and test

```bash
npm run build
npm test
```

## Endpoints covered

- `GET /markets?series_ticker=X&status=open`
- `GET /markets/{ticker}/orderbook`
- `GET /portfolio/balance`
- `GET /portfolio/positions`
- `POST /portfolio/orders`
- `DELETE /portfolio/orders/{order_id}`
- `GET /portfolio/fills`
- `GET /markets/trades`
- `GET /series/{series_ticker}`
- `GET /events/{event_ticker}`

See [USAGE.md](./USAGE.md) for examples and command details.
