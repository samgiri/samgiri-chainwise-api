import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Serverless functions cold-start independently, so a generous per-instance
  // pool size multiplies across concurrent instances and exhausts the
  // database's connection limit -- keep each instance's pool small and fail
  // fast on connect rather than hanging.
  max: 3,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
