export const formatRiskScore = (score: number): string => {
  if (score <= 30) return `🟢 Low (${score}/100)`;
  if (score <= 60) return `🟡 Medium (${score}/100)`;
  if (score <= 80) return `🔴 High (${score}/100)`;
  return `🔴🔴 CRITICAL (${score}/100)`;
};

export const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);
