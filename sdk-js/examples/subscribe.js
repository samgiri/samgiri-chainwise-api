const { ChainWise } = require('../dist');

async function main() {
  const chainwise = new ChainWise();
  // Overridable via TEST_EMAIL so this example can be re-run repeatedly (e.g. in CI)
  // without tripping the API's duplicate-email check.
  const email = process.env.TEST_EMAIL || 'you@example.com';

  const result = await chainwise.subscribe({ email, source: 'sdk-example' });
  console.log(result.message);
}

main().catch((err) => {
  console.error('Subscribe failed:', err.message);
  process.exit(1);
});
