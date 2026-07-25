import express from 'express';
import { isAddress } from 'ethers';
import pool from '../config/database';
import { BlockchainService, SUPPORTED_CHAINS, ChainName } from '../services/blockchain';
import { AnalysisService } from '../services/analysis';

const router = express.Router();

const blockchainService = new BlockchainService(process.env.ETHERSCAN_API_KEY || '');
const analysisService = new AnalysisService();

router.post('/analyze', async (req, res) => {
  try {
    const { protocol_address, chain } = req.body;

    if (!protocol_address || !isAddress(protocol_address)) {
      return res.status(400).json({ error: 'Invalid protocol_address' });
    }
    if (!chain || !SUPPORTED_CHAINS.includes(chain)) {
      return res.status(400).json({ error: `Invalid chain. Supported: ${SUPPORTED_CHAINS.join(', ')}` });
    }

    const typedChain = chain as ChainName;

    const [source, balance, transactions] = await Promise.all([
      blockchainService.getContractCode(protocol_address, typedChain),
      blockchainService.getContractBalance(protocol_address, typedChain),
      blockchainService.getRecentTransactions(protocol_address, typedChain),
    ]);
    const bytecodeInfo = blockchainService.analyzeBytecode(source);

    const result = analysisService.calculateRiskScore({ source, balance, transactions, bytecodeInfo });

    const dbResult = await pool.query(
      `INSERT INTO case_studies
        (protocol_name, contract_address, chain, risk_score, confidence, classification, analysis, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        source.contractName || protocol_address,
        protocol_address,
        typedChain,
        result.riskScore,
        result.confidence,
        result.classification,
        JSON.stringify(result.layers),
        'analyzed',
        'api',
      ]
    );

    res.json({
      case_id: dbResult.rows[0].id,
      protocol_address,
      chain: typedChain,
      risk_score: result.riskScore,
      classification: result.classification,
      confidence: result.confidence,
      layers: result.layers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

export default router;
