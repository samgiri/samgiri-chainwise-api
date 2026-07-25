import pool from '../config/database';

const CASE_STUDY_PROTOCOL_NAME = 'Example Protocol Zeta';
const CASE_STUDY_CONTRACT_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const ANALYSIS_LAYERS = {
  patternRecognition: {
    score: 95,
    findings: [
      'Guaranteed returns language detected',
      'MLM/referral scheme language detected',
      'Unrealistic APY/APR (>=100%) mentioned',
    ],
  },
  bytecodeAnalysis: {
    score: 90,
    findings: [
      'Centralized/dangerous functions found: mint, pause, blacklist, withdraw',
      'Contract contains selfdestruct capability',
    ],
  },
  treasuryFlow: {
    score: 92,
    findings: [
      'Contract balance near zero despite significant historical outflows — possible drained treasury',
      'Large recent outflows relative to current balance',
    ],
  },
  withdrawalDynamics: {
    score: 98,
    findings: [
      'Contract has pause/unpause capability — withdrawals can be halted by admin',
      'Multiple failed withdrawal-related transactions detected — possible withdrawal blocking',
    ],
  },
  bridgeExploitation: {
    score: 60,
    findings: ['Elevated proportion of bridge-related activity shortly before treasury drain'],
  },
  offRampActivity: {
    score: 88,
    findings: ['Majority of outbound value sent to a single address — possible off-ramp concentration'],
  },
  sybilClustering: {
    score: 70,
    findings: ['Multiple time windows with 3+ distinct wallets transacting within the same minute — possible coordinated activity'],
  },
  transactionAttribution: {
    score: 85,
    findings: [
      'Contract uses centralized ownership (Ownable/onlyOwner pattern)',
      'No renounceOwnership function found — ownership cannot be trustlessly relinquished',
    ],
  },
};

const CASE_STUDY_HTML = `
<article class="case-study">
  <div class="disclaimer">
    <p><strong>⚠️ ILLUSTRATIVE EXAMPLE</strong></p>
    <p>This is a demo case study to showcase platform capabilities. Not a real protocol analysis.
    The protocol name, address, and on-chain figures below are synthesized to demonstrate ChainWise's
    8-layer risk methodology and are not a claim about any real, currently operating project.</p>
  </div>
  <h1>Example Protocol Zeta — Risk Case Study</h1>
  <p><strong>Risk Score:</strong> 95 / 100 (Critical)</p>
  <p><strong>Classification:</strong> MLM Pyramid Scheme</p>
  <h2>Risk Assessment Results (Fictional Example)</h2>
  <p>This example illustrates the risk signature typical of MLM-style yield protocols: guaranteed-return
  marketing language, centralized admin controls capable of halting withdrawals, and treasury outflows
  concentrated to a small number of wallets shortly before liquidity dried up.</p>
  <h2>8-Layer Breakdown</h2>
  <ul>
    <li>Pattern Recognition: 95/100 — guaranteed-yield and referral/matrix language present</li>
    <li>Bytecode Analysis: 90/100 — mint, pause, blacklist, and withdraw functions under admin control</li>
    <li>Treasury Flow: 92/100 — balance drained to near zero after large recent outflows</li>
    <li>Withdrawal Dynamics: 98/100 — pause capability plus failed withdrawal transactions</li>
    <li>Bridge Exploitation: 60/100 — elevated bridge activity preceding the drain</li>
    <li>Off-Ramp Activity: 88/100 — outbound value concentrated to one address</li>
    <li>Sybil Clustering: 70/100 — coordinated wallet activity in tight time windows</li>
    <li>Transaction Attribution: 85/100 — centralized, non-renounced ownership</li>
  </ul>
  <h2>Predicted Collapse Timeline (illustrative)</h2>
  <p>60–90 days from onset of declining new-deposit inflow to full treasury exit, consistent with
  typical Ponzi-style liquidity dynamics.</p>
  <h2>Estimated Loss (illustrative)</h2>
  <p>$2.3M in synthesized/example figures, representative of mid-size MLM protocol collapses.</p>
</article>
`.trim();

export const seedCaseStudies = async (): Promise<void> => {
  try {
    const existing = await pool.query(
      'SELECT id FROM case_studies WHERE protocol_name = $1 AND contract_address = $2',
      [CASE_STUDY_PROTOCOL_NAME, CASE_STUDY_CONTRACT_ADDRESS]
    );
    if (existing.rows.length > 0) {
      return;
    }

    await pool.query(
      `INSERT INTO case_studies
        (protocol_name, contract_address, chain, risk_score, confidence, classification, analysis,
         case_study_html, predicted_collapse, estimated_loss, published, published_date, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13)`,
      [
        CASE_STUDY_PROTOCOL_NAME,
        CASE_STUDY_CONTRACT_ADDRESS,
        'ethereum',
        95,
        0.95,
        'MLM Pyramid Scheme',
        JSON.stringify(ANALYSIS_LAYERS),
        CASE_STUDY_HTML,
        '60-90 days from onset of declining deposits to full treasury exit (illustrative estimate)',
        '$2.3M (illustrative estimate)',
        true,
        'seed',
        'published',
      ]
    );
    console.log('✅ Case study seeded');
  } catch (err) {
    console.error('Failed to seed case study:', err);
  }
};
