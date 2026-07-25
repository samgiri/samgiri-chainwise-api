import os

from chainwise import ChainWise


def main():
    client = ChainWise()
    # Overridable via TEST_EMAIL so this example can be re-run repeatedly (e.g. in CI)
    # without tripping the API's duplicate-email check.
    email = os.environ.get("TEST_EMAIL", "you@example.com")

    result = client.subscribe(email)
    print(result["message"])


if __name__ == "__main__":
    main()
