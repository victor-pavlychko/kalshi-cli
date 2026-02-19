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

### Create order

```bash
kalshi order create \
  --ticker CPI-24DEC-T3.0 \
  --side yes \
  --action buy \
  --count 10 \
  --type limit \
  --yes-price 47 \
  --client-order-id my-bot-001
```

### Cancel order

```bash
kalshi order cancel <order_id>
```

### Get fills

```bash
kalshi fills --limit 100
```

### Get public trades

```bash
kalshi trades --ticker CPI-24DEC-T3.0 --limit 200
```

### Get series info

```bash
kalshi series CPI
```

### Get event info

```bash
kalshi event CPI-24DEC
```

## Automation tips

- Keep `--pretty` off for compact machine output.
- Capture stdout and parse JSON in your orchestration layer.
- Use non-zero exit code to detect API and validation failures.
- Set `KALSHI_BASE_URL` if Kalshi changes hostnames.
