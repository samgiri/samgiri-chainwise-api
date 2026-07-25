from chainwise import ChainWise


def main():
    client = ChainWise()
    cases = client.get_cases(limit=5)

    if not cases:
        print("No published case studies yet.")
        return

    for case in cases:
        print(f"#{case['id']} {case['protocol_name']} — {case['risk_score']}/100 ({case['classification']})")


if __name__ == "__main__":
    main()
