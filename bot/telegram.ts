import axios from 'axios';

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const API_BASE_URL = process.env.API_BASE_URL || 'https://chainwise-api-production.vercel.app';

export interface InlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface ParsedCommand {
  command: string;
  args: string[];
}

export class TelegramBot {
  private apiUrl: string;

  constructor(token: string) {
    this.apiUrl = `${TELEGRAM_API_BASE}/bot${token}`;
  }

  async sendMessage(chatId: number | string, text: string): Promise<void> {
    await axios.post(
      `${this.apiUrl}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' },
      { timeout: 5000 }
    );
  }

  async sendMessageWithButtons(chatId: number | string, text: string, buttons: InlineButton[][]): Promise<void> {
    await axios.post(
      `${this.apiUrl}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } },
      { timeout: 5000 }
    );
  }
}

export const parseCommand = (text: string): ParsedCommand | null => {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return null;
  const parts = trimmed.split(/\s+/);
  const command = parts[0].slice(1).split('@')[0].toLowerCase();
  if (!command) return null;
  return { command, args: parts.slice(1) };
};

export const formatRiskScore = (score: number): string => {
  if (score <= 30) return `🟢 Low (${score}/100)`;
  if (score <= 60) return `🟡 Medium (${score}/100)`;
  if (score <= 80) return `🔴 High (${score}/100)`;
  return `🔴🔴 CRITICAL (${score}/100)`;
};

export const handleStart = async (bot: TelegramBot, chatId: number | string): Promise<void> => {
  await bot.sendMessage(chatId, '👋 Welcome to ChainWise. Send /help to see what I can do.');
};

export const handleHelp = async (bot: TelegramBot, chatId: number | string): Promise<void> => {
  const text = [
    '<b>ChainWise Risk Bot — Commands</b>',
    '/start — Welcome message',
    '/help — Show this list',
    '/analyze 0xADDRESS chain — Run an 8-layer risk analysis (chain: ethereum, polygon, arbitrum, optimism, base)',
    '/cases — List published risk case studies',
    '/case ID — Get full details for a case study',
  ].join('\n');
  await bot.sendMessage(chatId, text);
};

export const handleAnalyze = async (bot: TelegramBot, chatId: number | string, args: string[]): Promise<void> => {
  const [address, chain] = args;
  if (!address || !chain) {
    await bot.sendMessage(
      chatId,
      'Usage: /analyze 0xADDRESS chain\nExample: /analyze 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 ethereum'
    );
    return;
  }

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/analyze`,
      { protocol_address: address, chain },
      { timeout: 8000 }
    );

    const layerLines = Object.entries(data.layers as Record<string, { score: number }>)
      .map(([name, layer]) => `• ${name}: ${layer.score}/100`)
      .join('\n');

    const text = [
      '<b>Risk Analysis</b>',
      `Address: <code>${data.protocol_address}</code>`,
      `Chain: ${data.chain}`,
      `Risk Score: ${formatRiskScore(data.risk_score)}`,
      `Classification: ${data.classification}`,
      `Confidence: ${Math.round(data.confidence * 100)}%`,
      '',
      '<b>8-Layer Breakdown</b>',
      layerLines,
    ].join('\n');

    await bot.sendMessage(chatId, text);
  } catch (err) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : 'Analysis failed. Please check the address and chain and try again.';
    await bot.sendMessage(chatId, `⚠️ ${message}`);
  }
};

export const handleListCases = async (bot: TelegramBot, chatId: number | string): Promise<void> => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/cases`, { params: { limit: 10 }, timeout: 8000 });

    if (!data.cases.length) {
      await bot.sendMessage(chatId, 'No published case studies yet.');
      return;
    }

    const summary = data.cases
      .map((c: any) => `#${c.id} ${c.protocol_name} — ${formatRiskScore(c.risk_score)}`)
      .join('\n');
    const buttons = data.cases
      .slice(0, 5)
      .map((c: any) => [{ text: `View #${c.id}`, url: `${API_BASE_URL}/api/cases/${c.id}` }]);

    await bot.sendMessageWithButtons(
      chatId,
      ['<b>Case Studies</b>', summary, '', 'Use /case ID for full details.'].join('\n'),
      buttons
    );
  } catch (err) {
    await bot.sendMessage(chatId, '⚠️ Failed to fetch case studies.');
  }
};

export const handleGetCase = async (bot: TelegramBot, chatId: number | string, args: string[]): Promise<void> => {
  const id = args[0];
  if (!id) {
    await bot.sendMessage(chatId, 'Usage: /case ID');
    return;
  }

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/cases/${id}`, { timeout: 8000 });
    const text = [
      `<b>${data.protocol_name}</b>`,
      `Risk Score: ${formatRiskScore(data.risk_score)}`,
      `Classification: ${data.classification}`,
      `Chain: ${data.chain}`,
      `Predicted Collapse: ${data.predicted_collapse}`,
      `Estimated Loss: ${data.estimated_loss}`,
    ].join('\n');
    await bot.sendMessage(chatId, text);
  } catch (err) {
    await bot.sendMessage(chatId, `⚠️ Case #${id} not found.`);
  }
};
