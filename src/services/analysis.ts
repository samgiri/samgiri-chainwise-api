import { ContractSource, ContractBalance, Transaction, BytecodeInfo } from './blockchain';

export interface LayerResult {
  score: number;
  findings: string[];
}

export interface AnalysisLayers {
  patternRecognition: LayerResult;
  bytecodeAnalysis: LayerResult;
  treasuryFlow: LayerResult;
  withdrawalDynamics: LayerResult;
  bridgeExploitation: LayerResult;
  offRampActivity: LayerResult;
  sybilClustering: LayerResult;
  transactionAttribution: LayerResult;
}

export interface AnalysisContext {
  source: ContractSource;
  balance: ContractBalance;
  transactions: Transaction[];
  bytecodeInfo: BytecodeInfo;
}

export interface AnalysisResult {
  riskScore: number;
  classification: string;
  confidence: number;
  layers: AnalysisLayers;
}

const WEIGHTS: Record<keyof AnalysisLayers, number> = {
  patternRecognition: 0.15,
  bytecodeAnalysis: 0.2,
  treasuryFlow: 0.18,
  withdrawalDynamics: 0.15,
  bridgeExploitation: 0.1,
  offRampActivity: 0.12,
  sybilClustering: 0.05,
  transactionAttribution: 0.05,
};

export class AnalysisService {
  calculateRiskScore(context: AnalysisContext): AnalysisResult {
    const layers: AnalysisLayers = {
      patternRecognition: this.layerPatternRecognition(context.source),
      bytecodeAnalysis: this.layerBytecodeAnalysis(context.bytecodeInfo),
      treasuryFlow: this.layerTreasuryFlow(context.balance, context.transactions),
      withdrawalDynamics: this.layerWithdrawalDynamics(context.bytecodeInfo, context.transactions),
      bridgeExploitation: this.layerBridgeExploitation(context.transactions),
      offRampActivity: this.layerOffRampActivity(context.transactions),
      sybilClustering: this.layerSybilClustering(context.transactions),
      transactionAttribution: this.layerTransactionAttribution(context.source, context.bytecodeInfo),
    };

    const weightedSum =
      layers.patternRecognition.score * WEIGHTS.patternRecognition +
      layers.bytecodeAnalysis.score * WEIGHTS.bytecodeAnalysis +
      layers.treasuryFlow.score * WEIGHTS.treasuryFlow +
      layers.withdrawalDynamics.score * WEIGHTS.withdrawalDynamics +
      layers.bridgeExploitation.score * WEIGHTS.bridgeExploitation +
      layers.offRampActivity.score * WEIGHTS.offRampActivity +
      layers.sybilClustering.score * WEIGHTS.sybilClustering +
      layers.transactionAttribution.score * WEIGHTS.transactionAttribution;

    const riskScore = Math.round(Math.min(100, Math.max(0, weightedSum)));

    return {
      riskScore,
      classification: this.classify(riskScore, layers),
      confidence: this.calculateConfidence(context),
      layers,
    };
  }

  private classify(riskScore: number, layers: AnalysisLayers): string {
    if (riskScore < 30) return 'Normal Protocol';

    const mlmScore = layers.patternRecognition.score;
    const rugPullScore =
      (layers.bytecodeAnalysis.score + layers.withdrawalDynamics.score + layers.transactionAttribution.score) / 3;
    const liquidityTrapScore = (layers.treasuryFlow.score + layers.offRampActivity.score + layers.bridgeExploitation.score) / 3;

    const max = Math.max(mlmScore, rugPullScore, liquidityTrapScore);
    if (max === mlmScore && mlmScore > 0) return 'MLM Pyramid Scheme';
    if (max === liquidityTrapScore) return 'Liquidity Trap';
    return 'Rug Pull Risk';
  }

  private calculateConfidence(context: AnalysisContext): number {
    let points = 0;
    if (context.source.isVerified) points += 1;
    if (context.transactions.length > 0) points += 1;
    if (context.balance) points += 1;
    return Math.round((points / 3) * 100) / 100;
  }

  private layerPatternRecognition(source: ContractSource): LayerResult {
    const findings: string[] = [];
    let score = 0;
    const text = `${source.contractName} ${source.sourceCode}`.toLowerCase();

    const patterns: [RegExp, number, string][] = [
      [/guaranteed\s+(returns?|profit|income)/, 25, 'Guaranteed returns language detected'],
      [/\b\d{3,}\s*%\s*(apy|apr)\b/, 30, 'Unrealistic APY/APR (>=100%) mentioned'],
      [/referral|downline|upline|matrix\s+plan/, 25, 'MLM/referral scheme language detected'],
      [/passive\s+income/, 10, '"Passive income" marketing language detected'],
      [/double\s+your/, 20, '"Double your investment" language detected'],
    ];

    for (const [regex, weight, label] of patterns) {
      if (regex.test(text)) {
        score += weight;
        findings.push(label);
      }
    }

    if (!source.isVerified) {
      findings.push('Source code unverified — pattern scan limited to contract name only');
    }
    if (findings.length === 0) {
      findings.push('No pyramid/unrealistic-yield language detected');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerBytecodeAnalysis(bytecodeInfo: BytecodeInfo): LayerResult {
    const findings: string[] = [];

    if (!bytecodeInfo.isVerified) {
      findings.push('Contract source is unverified — logic cannot be audited, treated as elevated risk');
      return { score: 70, findings };
    }

    let score = 0;
    if (bytecodeInfo.dangerousFunctions.length > 0) {
      score += Math.min(60, bytecodeInfo.dangerousFunctions.length * 15);
      findings.push(`Centralized/dangerous functions found: ${bytecodeInfo.dangerousFunctions.join(', ')}`);
    }
    if (bytecodeInfo.hasSelfdestruct) {
      score += 25;
      findings.push('Contract contains selfdestruct capability');
    }
    if (bytecodeInfo.hasDelegatecall) {
      score += 15;
      findings.push('Contract uses delegatecall (proxy/upgradeable pattern — verify upgrade admin)');
    }
    if (findings.length === 0) {
      findings.push('No obviously dangerous functions detected in verified source');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerTreasuryFlow(balance: ContractBalance, transactions: Transaction[]): LayerResult {
    const findings: string[] = [];

    if (transactions.length === 0) {
      findings.push('No transaction history available to assess treasury flow');
      return { score: 20, findings };
    }

    let score = 0;
    const outflows = transactions.filter((tx) => Number(tx.value) > 0);
    const totalOutflowEth = outflows.reduce((sum, tx) => sum + Number(tx.value), 0) / 1e18;

    if (balance.eth < 0.01 && totalOutflowEth > 1) {
      score += 40;
      findings.push('Contract balance near zero despite significant historical outflows — possible drained treasury');
    }

    const recentOutflowEth = transactions.slice(0, 10).reduce((sum, tx) => sum + Number(tx.value), 0) / 1e18;
    if (balance.eth > 0 && recentOutflowEth > balance.eth * 2) {
      score += 30;
      findings.push('Large recent outflows relative to current balance');
    }

    const uniqueRecipients = new Set(outflows.map((tx) => tx.to.toLowerCase()));
    if (outflows.length > 5 && uniqueRecipients.size <= 2) {
      score += 20;
      findings.push('Outflows concentrated to very few recipient addresses');
    }

    if (findings.length === 0) {
      findings.push('No concerning treasury flow patterns detected');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerWithdrawalDynamics(bytecodeInfo: BytecodeInfo, transactions: Transaction[]): LayerResult {
    const findings: string[] = [];
    let score = 0;

    const hasPauseFunction = bytecodeInfo.dangerousFunctions.some((f) => /pause/i.test(f));
    if (hasPauseFunction) {
      score += 35;
      findings.push('Contract has pause/unpause capability — withdrawals can be halted by admin');
    }

    const withdrawalCalls = transactions.filter((tx) => /withdraw|pause|blacklist/i.test(tx.functionName));
    const failedWithdrawals = withdrawalCalls.filter((tx) => tx.isError);
    if (failedWithdrawals.length > 0) {
      score += 40;
      findings.push(`${failedWithdrawals.length} failed withdrawal-related transaction(s) detected — possible withdrawal blocking`);
    }

    if (findings.length === 0) {
      findings.push('No withdrawal restriction patterns detected');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerBridgeExploitation(transactions: Transaction[]): LayerResult {
    const findings: string[] = [];
    let score = 0;

    const bridgeLike = transactions.filter((tx) => /bridge|relay|crosschain|lockbox/i.test(tx.functionName));
    if (bridgeLike.length > 0) {
      const failedBridgeCalls = bridgeLike.filter((tx) => tx.isError);
      if (failedBridgeCalls.length > 0) {
        score += 40;
        findings.push(`${failedBridgeCalls.length} failed bridge-related transaction(s) detected`);
      }
      if (bridgeLike.length > transactions.length * 0.3) {
        score += 30;
        findings.push('Unusually high proportion of bridge-related activity');
      }
    }

    if (findings.length === 0) {
      findings.push('No bridge exploitation signals detected in available transaction history');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerOffRampActivity(transactions: Transaction[]): LayerResult {
    const findings: string[] = [];
    const outflows = transactions.filter((tx) => Number(tx.value) > 0);

    if (outflows.length === 0) {
      findings.push('No outbound value transfers found in available history');
      return { score: 0, findings };
    }

    const totalOut = outflows.reduce((sum, tx) => sum + Number(tx.value), 0);
    const byRecipient = new Map<string, number>();
    for (const tx of outflows) {
      const key = tx.to.toLowerCase();
      byRecipient.set(key, (byRecipient.get(key) || 0) + Number(tx.value));
    }
    const maxSingle = Math.max(...byRecipient.values());
    const concentration = totalOut > 0 ? maxSingle / totalOut : 0;

    let score = 0;
    if (concentration > 0.7 && byRecipient.size > 1) {
      score += 45;
      findings.push(`${Math.round(concentration * 100)}% of outbound value sent to a single address — possible off-ramp concentration`);
    } else if (concentration > 0.4) {
      score += 20;
      findings.push('Moderate concentration of outbound value to one address');
    }

    if (findings.length === 0) {
      findings.push('Outbound value transfers appear distributed, no off-ramp concentration detected');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerSybilClustering(transactions: Transaction[]): LayerResult {
    const findings: string[] = [];
    const inbound = transactions.filter((tx) => Number(tx.value) > 0);

    if (inbound.length < 5) {
      findings.push('Insufficient transaction volume to assess wallet clustering');
      return { score: 10, findings };
    }

    const byMinute = new Map<number, Set<string>>();
    for (const tx of inbound) {
      const bucket = Math.floor(tx.timeStamp / 60);
      if (!byMinute.has(bucket)) byMinute.set(bucket, new Set());
      byMinute.get(bucket)!.add(tx.from.toLowerCase());
    }
    const burstBuckets = [...byMinute.values()].filter((set) => set.size >= 3);

    let score = 0;
    if (burstBuckets.length > 0) {
      score += Math.min(60, burstBuckets.length * 20);
      findings.push(`${burstBuckets.length} time window(s) with 3+ distinct wallets transacting within the same minute — possible coordinated activity`);
    }

    if (findings.length === 0) {
      findings.push('No coordinated wallet clustering patterns detected');
    }

    return { score: Math.min(100, score), findings };
  }

  private layerTransactionAttribution(source: ContractSource, bytecodeInfo: BytecodeInfo): LayerResult {
    const findings: string[] = [];
    let score = 0;

    const hasOwnable = source.isVerified && /\bonlyOwner\b|\bOwnable\b/.test(source.sourceCode);
    const hasRenounce = bytecodeInfo.dangerousFunctions.some((f) => /renounceownership/i.test(f));

    if (hasOwnable) {
      score += 20;
      findings.push('Contract uses centralized ownership (Ownable/onlyOwner pattern)');
      if (!hasRenounce) {
        score += 15;
        findings.push('No renounceOwnership function found — ownership cannot be trustlessly relinquished');
      }
    }
    if (!source.isVerified) {
      score += 20;
      findings.push('Cannot attribute admin/owner roles — source unverified');
    }
    if (findings.length === 0) {
      findings.push('No centralized ownership risk detected');
    }

    return { score: Math.min(100, score), findings };
  }
}
