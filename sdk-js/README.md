# @chainwise/sdk

Official JavaScript/TypeScript SDK for the [ChainWise](https://thechainwise.com) DeFi Risk Intelligence API.

## Installation

```bash
npm install @chainwise/sdk
```

## Quick start

```ts
import { ChainWise } from '@chainwise/sdk';

const chainwise = new ChainWise();

const result = await chainwise.analyze({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chain: 'ethereum',
});

console.log(result.risk_score, result.classification);
```

## Authentication

Most endpoints (`analyze`, `getCases`, `getCase`, `subscribe`) are public and require no API key. If your account has API keys enabled for higher rate limits, pass one to the constructor:

```ts
const chainwise = new ChainWise('your-api-key');
```

You can also point the client at a different deployment (e.g. a local dev server):

```ts
const chainwise = new ChainWise(undefined, { baseUrl: 'http://localhost:3000' });
```

## API reference

### `analyze(options)`

Runs the 8-layer risk analysis on a contract address.

```ts
const result = await chainwise.analyze({
  address: '0x...',
  chain: 'ethereum', // 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base'
});
```

Returns a `RiskAnalysis`: `{ case_id, protocol_address, chain, risk_score, classification, confidence, layers }`.

### `getCases(options?)`

Lists published risk case studies.

```ts
const cases = await chainwise.getCases({ limit: 10, offset: 0, chain: 'ethereum' });
```

Returns `CaseSummary[]`. Note this is the list view — it does not include the full analysis breakdown or HTML report; use `getCase(id)` for that.

### `getCase(id)`

Fetches full details for a single case study, including the 8-layer analysis and HTML report.

```ts
const detail = await chainwise.getCase(2);
```

Returns a `CaseStudy`. Throws `ChainWiseError` (status 404) if the case doesn't exist or isn't published.

### `subscribe(options)`

Subscribes an email to DeFi risk alerts.

```ts
const result = await chainwise.subscribe({ email: 'you@example.com', source: 'my-app' });
```

## Error handling

All methods throw a `ChainWiseError` on non-2xx responses, carrying the HTTP status and the parsed response body:

```ts
import { ChainWise, ChainWiseError } from '@chainwise/sdk';

try {
  await chainwise.getCase(999999);
} catch (err) {
  if (err instanceof ChainWiseError) {
    console.error(err.status, err.message); // 404 "Case study not found"
  }
}
```

## Rate limiting

The API enforces a shared rate limit per client IP across all `/api/*` endpoints. If you exceed it, calls throw a `ChainWiseError` with `status: 429`. Back off and retry after a short delay; the limit resets on a rolling window.

## Helpers

```ts
import { formatRiskScore, isValidAddress } from '@chainwise/sdk';

formatRiskScore(95); // "🔴🔴 CRITICAL (95/100)"
isValidAddress('0xa0b8...'); // true
```

## Examples

See [`examples/`](./examples) for runnable scripts covering `analyze`, `getCases`, and `subscribe`.

## License

MIT
