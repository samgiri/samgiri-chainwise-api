import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const result = await pool.query(
      'SELECT id, user_id, rate_limit, calls_today, revoked FROM api_keys WHERE api_key = $1',
      [apiKey]
    );

    const record = result.rows[0];

    if (!record || record.revoked) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (record.calls_today >= record.rate_limit) {
      return res.status(429).json({ error: 'Daily API rate limit exceeded' });
    }

    await pool.query('UPDATE api_keys SET calls_today = calls_today + 1 WHERE id = $1', [record.id]);

    req.apiKeyRecord = record;
    next();
  } catch (err) {
    next(err);
  }
};
