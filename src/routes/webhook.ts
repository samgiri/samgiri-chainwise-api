import express from 'express';
import {
  TelegramBot,
  parseCommand,
  handleStart,
  handleHelp,
  handleAnalyze,
  handleListCases,
  handleGetCase,
} from '../../bot/telegram';

const router = express.Router();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '');

router.post('/telegram', async (req, res) => {
  const secretHeader = req.header('x-telegram-bot-api-secret-token');
  if (!process.env.WEBHOOK_SECRET || secretHeader !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  try {
    const message = req.body?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    if (chatId && typeof text === 'string') {
      const parsed = parseCommand(text);
      if (parsed) {
        switch (parsed.command) {
          case 'start':
            await handleStart(bot, chatId);
            break;
          case 'help':
            await handleHelp(bot, chatId);
            break;
          case 'analyze':
            await handleAnalyze(bot, chatId, parsed.args);
            break;
          case 'cases':
            await handleListCases(bot, chatId);
            break;
          case 'case':
            await handleGetCase(bot, chatId, parsed.args);
            break;
          default:
            await bot.sendMessage(chatId, `Unknown command: /${parsed.command}\nSend /help for a list of commands.`);
        }
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  // Telegram retries delivery on non-2xx, so always ack once we've attempted processing.
  res.status(200).json({ ok: true });
});

export default router;
