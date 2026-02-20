# kalshi-cli

A simple TypeScript command-line utility for interacting with the official Kalshi Trade API in automated workflows (including agentic workflows).

- No third-party runtime libraries (uses Node.js built-ins only).
- Supports both production and demo/sandbox environments.
- Machine-friendly JSON output by default.
- Includes `orders list` for robust autonomous order-state reconciliation.
- Supports `--post-only`, `--expiration-ts`, and `--buy-max-cost` safety controls.
- Supports `order amend` for atomic order updates.

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

## Installation from a public GitHub repository (with npm)

Install globally directly from a public GitHub repo:

```bash
npm install -g github:<owner>/<repo>
```

For example:

```bash
npm install -g github:kalshi/kalshi-cli
```

The package is configured to build automatically during git-based install (`prepare` script), so `dist/cli.js` is generated for the `kalshi` binary.

Then run:

```bash
kalshi help
```

If `kalshi` is not found, your npm global bin directory may not be on `PATH`.

Check where npm installs global binaries:

```bash
npm bin -g
```

Temporarily add it to your shell `PATH` (replace `<npm-global-bin>` with the output above):

```bash
export PATH="<npm-global-bin>:$PATH"
```

Then verify again:

```bash
kalshi help
```

If your environment blocks global npm binaries entirely, use a local clone and link:

```bash
git clone https://github.com/kalshi/kalshi-cli.git
cd kalshi-cli
npm install
npm link
kalshi help
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
- `GET /portfolio/orders`
- `POST /portfolio/orders`
- `POST /portfolio/orders/{order_id}/amend`
- `DELETE /portfolio/orders/{order_id}`
- `GET /portfolio/fills`
- `GET /portfolio/settlements`
- `GET /markets/trades`
- `GET /series`
- `GET /series/{series_ticker}`
- `GET /events/{event_ticker}`

See [USAGE.md](./USAGE.md) for examples and command details.
