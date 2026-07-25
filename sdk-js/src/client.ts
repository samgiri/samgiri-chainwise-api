import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AnalysisOptions, RiskAnalysis, ListCasesOptions, CaseSummary, CaseStudy, SubscribeOptions, SubscribeResponse } from './types';

export interface ChainWiseOptions {
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://chainwise-api-production.vercel.app';

export class ChainWiseError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ChainWiseError';
    this.status = status;
    this.body = body;
  }
}

export class ChainWise {
  private http: AxiosInstance;

  constructor(apiKey?: string, options: ChainWiseOptions = {}) {
    this.http = axios.create({
      baseURL: options.baseUrl || DEFAULT_BASE_URL,
      timeout: 10000,
      headers: apiKey ? { 'x-api-key': apiKey } : {},
    });
  }

  async analyze(options: AnalysisOptions): Promise<RiskAnalysis> {
    return this.request<RiskAnalysis>({
      method: 'post',
      url: '/api/analyze',
      data: { protocol_address: options.address, chain: options.chain },
    });
  }

  async getCases(options: ListCasesOptions = {}): Promise<CaseSummary[]> {
    const data = await this.request<{ cases: CaseSummary[] }>({
      method: 'get',
      url: '/api/cases',
      params: options,
    });
    return data.cases;
  }

  async getCase(id: number): Promise<CaseStudy> {
    return this.request<CaseStudy>({ method: 'get', url: `/api/cases/${id}` });
  }

  async subscribe(options: SubscribeOptions): Promise<SubscribeResponse> {
    return this.request<SubscribeResponse>({ method: 'post', url: '/api/subscribe', data: options });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.request<T>(config);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as { error?: string } | undefined;
        throw new ChainWiseError(body?.error || err.message, err.response?.status, err.response?.data);
      }
      throw err;
    }
  }
}
