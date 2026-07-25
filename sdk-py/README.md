# chainwise

Official Python SDK for the [ChainWise](https://thechainwise.com) DeFi Risk Intelligence API.

## Installation

```bash
pip install chainwise
```

## Quick start

```python
from chainwise import ChainWise

client = ChainWise()
result = client.analyze("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chain="ethereum")

print(result["risk_score"], result["classification"])
```

## Authentication

Most endpoints (`analyze`, `get_cases`, `get_case`, `subscribe`) are public and require no API key. If your account has API keys enabled for higher rate limits, pass one to the constructor:

```python
client = ChainWise(api_key="your-api-key")
```

You can also point the client at a different deployment (e.g. a local dev server):

```python
client = ChainWise(base_url="http://localhost:3000")
```

## API reference

### `analyze(protocol_address, chain="ethereum")`

Runs the 8-layer risk analysis on a contract address. `chain` is one of `"ethereum"`, `"polygon"`, `"arbitrum"`, `"optimism"`, `"base"`.

```python
result = client.analyze("0x...", chain="ethereum")
# {"case_id": ..., "risk_score": ..., "classification": ..., "confidence": ..., "layers": {...}}
```

### `get_cases(limit=10, offset=0, chain=None)`

Lists published risk case studies as a list of summary dicts. This is the list view — it does not include the full analysis breakdown or HTML report; use `get_case(id)` for that.

```python
cases = client.get_cases(limit=10, chain="ethereum")
```

### `get_case(case_id)`

Fetches full details for a single case study, including the 8-layer analysis and HTML report. Raises `ChainWiseError` with `status=404` if the case doesn't exist or isn't published.

```python
detail = client.get_case(2)
```

### `subscribe(email, mobile=None)`

Subscribes an email to DeFi risk alerts.

```python
result = client.subscribe("you@example.com")
```

## Error handling

All methods raise `ChainWiseError` on non-2xx responses, carrying the HTTP status and parsed response body:

```python
from chainwise import ChainWise, ChainWiseError

client = ChainWise()
try:
    client.get_case(999999)
except ChainWiseError as err:
    print(err.status, str(err))  # 404 "Case study not found"
```

## Rate limiting

The API enforces a shared rate limit per client IP across all `/api/*` endpoints. If you exceed it, calls raise `ChainWiseError` with `status=429`. Back off and retry after a short delay; the limit resets on a rolling window.

## Examples

See [`examples/`](./examples) for runnable scripts covering `analyze`, `get_cases`, and `subscribe`.

## License

MIT
