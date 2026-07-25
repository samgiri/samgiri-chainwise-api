import axios from 'axios';

export type ChainName = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';

const CHAIN_IDS: Record<ChainName, number> = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
};

export const SUPPORTED_CHAINS = Object.keys(CHAIN_IDS) as ChainName[];

const ETHERSCAN_V2_BASE_URL = 'https://api.etherscan.io/v2/api';
const REQUEST_TIMEOUT_MS = 3500;

export interface ContractSource {
  isVerified: boolean;
  contractName: string;
  sourceCode: string;
  abi: any[] | null;
}

export interface ContractBalance {
  wei: string;
  eth: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: number;
  functionName: string;
  isError: boolean;
}

export interface BytecodeInfo {
  isVerified: boolean;
  dangerousFunctions: string[];
  hasSelfdestruct: boolean;
  hasDelegatecall: boolean;
}

const DANGEROUS_FUNCTION_NAMES = [
  'mint',
  'pause',
  'unpause',
  'blacklist',
  'blacklistaddress',
  'excludefromfee',
  'setmaxtxamount',
  'settradingenabled',
  'removelimits',
  'emergencywithdraw',
  'withdraw',
  'setfee',
  'settaxfee',
  'transferownership',
];

export class BlockchainService {
  constructor(private apiKey: string) {}

  private async call(chain: ChainName, params: Record<string, string>): Promise<any> {
    const chainId = CHAIN_IDS[chain];
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`);
    const response = await axios.get(ETHERSCAN_V2_BASE_URL, {
      params: { chainid: chainId, apikey: this.apiKey, ...params },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  }

  async getContractCode(address: string, chain: ChainName): Promise<ContractSource> {
    const data = await this.call(chain, {
      module: 'contract',
      action: 'getsourcecode',
      address,
    });
    const result = data?.result?.[0];
    if (!result || !result.SourceCode) {
      return { isVerified: false, contractName: '', sourceCode: '', abi: null };
    }
    let abi: any[] | null = null;
    try {
      abi = JSON.parse(result.ABI);
    } catch {
      abi = null;
    }
    return {
      isVerified: true,
      contractName: result.ContractName || '',
      sourceCode: result.SourceCode,
      abi,
    };
  }

  async getContractBalance(address: string, chain: ChainName): Promise<ContractBalance> {
    const data = await this.call(chain, {
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
    });
    const wei = typeof data?.result === 'string' ? data.result : '0';
    return { wei, eth: Number(wei) / 1e18 };
  }

  async getRecentTransactions(address: string, chain: ChainName, limit = 50): Promise<Transaction[]> {
    const data = await this.call(chain, {
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: String(limit),
      sort: 'desc',
    });
    if (!Array.isArray(data?.result)) return [];
    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timeStamp: Number(tx.timeStamp),
      functionName: tx.functionName || '',
      isError: tx.isError === '1',
    }));
  }

  analyzeBytecode(source: ContractSource): BytecodeInfo {
    if (!source.isVerified) {
      return {
        isVerified: false,
        dangerousFunctions: [],
        hasSelfdestruct: false,
        hasDelegatecall: false,
      };
    }

    const dangerousFunctions: string[] = [];
    if (source.abi) {
      for (const item of source.abi) {
        if (item.type === 'function' && typeof item.name === 'string') {
          const nameLower = item.name.toLowerCase();
          if (DANGEROUS_FUNCTION_NAMES.some((n) => nameLower.includes(n))) {
            dangerousFunctions.push(item.name);
          }
        }
      }
    }

    const sourceLower = source.sourceCode.toLowerCase();
    return {
      isVerified: true,
      dangerousFunctions,
      hasSelfdestruct: sourceLower.includes('selfdestruct'),
      hasDelegatecall: sourceLower.includes('delegatecall'),
    };
  }
}
