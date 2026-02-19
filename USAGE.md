# USAGE

All commands emit JSON to stdout and are designed for scripting.

## Global flags

- `--env prod|demo`
- `--pretty` for human-readable formatting

## Commands

### List markets

```bash
kalshi --env demo markets list --series CPI --status open
```

### Get orderbook

```bash
kalshi orderbook CPI-24DEC-T3.0
```

### Get balance

```bash
kalshi balance
```

### Get positions

```bash
kalshi positions
kalshi positions --ticker CPI-24DEC-T3.0
```

### List resting/open orders

```bash
kalshi orders list
kalshi orders list --status resting --ticker CPI-24DEC-T3.0 --limit 100
```

### Create order (safe-by-default controls)

```bash
kalshi order create \
  --ticker CPI-24DEC-T3.0 \
  --side no \
  --action buy \
  --count 10 \
  --type limit \
  --no-price 53 \
  --post-only \
  --expiration-ts 1760000000000 \
  --buy-max-cost 530 \
  --client-order-id my-bot-001
```

### Amend existing resting order (atomic)

```bash
kalshi order amend <order_id> --no-price 55 --count 12 --post-only --expiration-ts 1760000000000
```

### Cancel order

```bash
kalshi order cancel <order_id>
```

### Get settlements (realized outcomes / P&L input)

```bash
kalshi settlements --limit 100
```

### Get fills

```bash
kalshi fills --limit 100
```

### Get public trades

```bash
kalshi trades --ticker CPI-24DEC-T3.0 --limit 200
```

### List series (discovery)

```bash
kalshi series list --limit 100
```

### Get series info

```bash
kalshi series CPI
```

### Get event info

```bash
kalshi event CPI-24DEC
```

## Pricing & risk semantics

- `--side yes` targets YES contracts; `--side no` targets NO contracts.
- Use `--yes-price` to price YES directly.
- Use `--no-price` to price NO directly.
- If both are provided, both are sent through to Kalshi exactly as provided.
- `--post-only` sets `post_only: true` to avoid taker fills from crossing limit prices.
- `--expiration-ts` (unix ms) rejects stale timestamps and should be used for all autonomous limit orders.
- `--buy-max-cost` enforces a max estimated buy notional in cents (`price * count`) before the order is sent.

## Automation tips

- Keep `--pretty` off for compact machine output.
- Capture stdout and parse JSON in your orchestration layer.
- Use non-zero exit code to detect API and validation failures.
- Use `orders list` heartbeat polling to reconcile local state with exchange truth.
- Set `KALSHI_BASE_URL` if Kalshi changes hostnames.
