from typing import List, TypedDict


class AnalysisLayer(TypedDict):
    score: int
    findings: List[str]


class AnalysisLayers(TypedDict):
    patternRecognition: AnalysisLayer
    bytecodeAnalysis: AnalysisLayer
    treasuryFlow: AnalysisLayer
    withdrawalDynamics: AnalysisLayer
    bridgeExploitation: AnalysisLayer
    offRampActivity: AnalysisLayer
    sybilClustering: AnalysisLayer
    transactionAttribution: AnalysisLayer


class RiskAnalysis(TypedDict):
    case_id: int
    protocol_address: str
    chain: str
    risk_score: int
    classification: str
    confidence: float
    layers: AnalysisLayers


class CaseSummary(TypedDict):
    """Shape returned by list_cases() -- does not include the full analysis or HTML report."""

    id: int
    protocol_name: str
    contract_address: str
    chain: str
    risk_score: int
    confidence: float
    classification: str
    predicted_collapse: str
    estimated_loss: str
    published_date: str


class CaseStudy(CaseSummary):
    """Shape returned by get_case() -- includes the full 8-layer analysis and HTML report."""

    analysis: dict
    case_study_html: str
    published: bool


class SubscribeResponse(TypedDict):
    success: bool
    user_id: int
    message: str
    alerts_enabled: bool
