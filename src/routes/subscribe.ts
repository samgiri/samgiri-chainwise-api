import express from 'express';
import pool from '../config/database';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

router.post('/subscribe', async (req, res) => {
  try {
    const { email, mobile, source } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    const result = await pool.query(
      'INSERT INTO users (email, mobile, source, email_verified, alerts_enabled) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, mobile || null, source || 'api', true, true]
    );

    const userId = result.rows[0].id;

    try {
      await sendConfirmationEmail(email);
    } catch (emailErr) {
      console.error('Failed to send confirmation email', emailErr);
    }

    res.json({
      success: true,
      user_id: userId,
      message: 'Successfully subscribed to alerts',
      alerts_enabled: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
