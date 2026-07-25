from chainwise import ChainWise


def main():
    client = ChainWise()
    result = client.analyze("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chain="ethereum")  # USDC

    print(f"Risk Score: {result['risk_score']}/100")
    print(f"Classification: {result['classification']}")
    print(f"Confidence: {round(result['confidence'] * 100)}%")
    print("Layers:", result["layers"])


if __name__ == "__main__":
    main()
