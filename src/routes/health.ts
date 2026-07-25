import express from 'express';
import pool from '../config/database';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: message,
    });
  }
});

export default router;
