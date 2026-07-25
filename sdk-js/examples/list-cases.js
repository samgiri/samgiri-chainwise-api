const { ChainWise, formatRiskScore } = require('../dist');

async function main() {
  const chainwise = new ChainWise();
  const cases = await chainwise.getCases({ limit: 5 });

  if (cases.length === 0) {
    console.log('No published case studies yet.');
    return;
  }

  for (const c of cases) {
    console.log(`#${c.id} ${c.protocol_name} — ${formatRiskScore(c.risk_score)} (${c.classification})`);
  }
}

main().catch((err) => {
  console.error('Failed to list cases:', err.message);
  process.exit(1);
});
