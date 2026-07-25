from typing import Any, Dict, List, Optional

import requests

DEFAULT_BASE_URL = "https://chainwise-api-production.vercel.app"


class ChainWiseError(Exception):
    """Raised for any non-2xx response from the ChainWise API."""

    def __init__(self, message: str, status: Optional[int] = None, body: Any = None):
        super().__init__(message)
        self.status = status
        self.body = body


class ChainWise:
    """Client for the ChainWise DeFi Risk Intelligence API.

    Args:
        api_key: Optional API key for accounts with elevated rate limits.
        base_url: Override the API base URL (e.g. for local development).
    """

    def __init__(self, api_key: Optional[str] = None, base_url: str = DEFAULT_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"x-api-key": api_key})

    def _request(self, method: str, path: str, **kwargs: Any) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            response = self.session.request(method, url, timeout=10, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as err:
            body: Dict[str, Any] = {}
            try:
                body = err.response.json()
            except ValueError:
                pass
            raise ChainWiseError(
                body.get("error", str(err)), status=err.response.status_code, body=body
            ) from err
        except requests.exceptions.RequestException as err:
            raise ChainWiseError(str(err)) from err

    def analyze(self, protocol_address: str, chain: str = "ethereum") -> Dict[str, Any]:
        """Run the 8-layer risk analysis on a contract address.

        Args:
            protocol_address: 0x-prefixed contract address.
            chain: One of "ethereum", "polygon", "arbitrum", "optimism", "base".

        Returns:
            A dict with case_id, protocol_address, chain, risk_score, classification,
            confidence, and the 8-layer breakdown under "layers".
        """
        return self._request(
            "POST", "/api/analyze", json={"protocol_address": protocol_address, "chain": chain}
        )

    def get_cases(
        self, limit: int = 10, offset: int = 0, chain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List published risk case studies. Returns summary objects (no full analysis/HTML);
        use get_case() for full details."""
        params: Dict[str, Any] = {"limit": limit, "offset": offset}
        if chain:
            params["chain"] = chain
        data = self._request("GET", "/api/cases", params=params)
        return data["cases"]

    def get_case(self, case_id: int) -> Dict[str, Any]:
        """Fetch full details for a single case study, including the 8-layer analysis
        and HTML report. Raises ChainWiseError(status=404) if not found or unpublished."""
        return self._request("GET", f"/api/cases/{case_id}")

    def subscribe(self, email: str, mobile: Optional[str] = None) -> Dict[str, Any]:
        """Subscribe an email to DeFi risk alerts."""
        payload: Dict[str, Any] = {"email": email, "source": "python-sdk"}
        if mobile:
            payload["mobile"] = mobile
        return self._request("POST", "/api/subscribe", json=payload)
