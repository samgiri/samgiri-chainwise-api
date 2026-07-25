from pathlib import Path

from setuptools import find_packages, setup

long_description = (Path(__file__).parent / "README.md").read_text(encoding="utf-8")

setup(
    name="chainwise",
    version="1.0.0",
    description="Official Python SDK for the ChainWise DeFi Risk Intelligence API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://thechainwise.com",
    packages=find_packages(exclude=["examples", "tests"]),
    install_requires=["requests>=2.31.0"],
    python_requires=">=3.8",
    license="MIT",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    keywords=["chainwise", "defi", "risk", "blockchain", "web3", "rug-pull"],
)
