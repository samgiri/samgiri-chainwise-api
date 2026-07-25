export type Chain = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';

export interface AnalysisOptions {
  address: string;
  chain: Chain;
}

export interface AnalysisLayer {
  score: number;
  findings: string[];
}

export interface AnalysisLayers {
  patternRecognition: AnalysisLayer;
  bytecodeAnalysis: AnalysisLayer;
  treasuryFlow: AnalysisLayer;
  withdrawalDynamics: AnalysisLayer;
  bridgeExploitation: AnalysisLayer;
  offRampActivity: AnalysisLayer;
  sybilClustering: AnalysisLayer;
  transactionAttribution: AnalysisLayer;
}

export type RiskClassification = 'Normal Protocol' | 'MLM Pyramid Scheme' | 'Rug Pull Risk' | 'Liquidity Trap';

export interface RiskAnalysis {
  case_id: number;
  protocol_address: string;
  chain: Chain;
  risk_score: number;
  classification: RiskClassification;
  confidence: number;
  layers: AnalysisLayers;
}

export interface ListCasesOptions {
  limit?: number;
  offset?: number;
  chain?: Chain;
  sort?: 'risk_score' | 'published_date';
  order?: 'asc' | 'desc';
}

/** Shape returned by GET /api/cases (list view) — does not include the full analysis or HTML report. */
export interface CaseSummary {
  id: number;
  protocol_name: string;
  contract_address: string;
  chain: string;
  risk_score: number;
  confidence: number;
  classification: string;
  predicted_collapse: string;
  estimated_loss: string;
  published_date: string;
}

/** Shape returned by GET /api/cases/:id — includes the full 8-layer analysis and HTML report. */
export interface CaseStudy extends CaseSummary {
  analysis: Record<string, AnalysisLayer>;
  case_study_html: string;
  published: boolean;
  downloads: { json: string; pdf: string | null };
}

export interface SubscribeOptions {
  email: string;
  mobile?: string;
  source?: string;
}

export interface SubscribeResponse {
  success: boolean;
  user_id: number;
  message: string;
  alerts_enabled: boolean;
}
