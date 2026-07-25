const { ChainWise, formatRiskScore } = require('../dist');

async function main() {
  const chainwise = new ChainWise();
  const result = await chainwise.analyze({
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    chain: 'ethereum',
  });

  console.log(`Risk Score: ${formatRiskScore(result.risk_score)}`);
  console.log(`Classification: ${result.classification}`);
  console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
  console.log('Layers:', result.layers);
}

main().catch((err) => {
  console.error('Analysis failed:', err.message);
  process.exit(1);
});
