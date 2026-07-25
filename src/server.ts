import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import subscribeRoutes from './routes/subscribe';
import analyzeRoutes from './routes/analyze';
import casesRoutes from './routes/cases';
import docsRoutes from './routes/docs';
import webhookRoutes from './routes/webhook';
import { rateLimit, errorHandler } from './middleware';
import { seedCaseStudies } from './services/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json());

// Scoped to /api only: the Telegram webhook is authenticated via a secret token
// instead, and a per-IP limiter would be meaningless there anyway since every
// user's messages arrive from Telegram's own servers under the same source IP.
//
// Raised from the original 10/min now that both the REST API and two published
// SDKs share this one budget per client IP -- 10 was a reasonable placeholder
// for a single client hitting a single endpoint, not for the combined legitimate
// traffic of REST callers, JS SDK users, and Python SDK users on one IP.
app.use('/api', rateLimit(20, 60000));

app.use('/api', healthRoutes);
app.use('/api', subscribeRoutes);
app.use('/api', analyzeRoutes);
app.use('/api', casesRoutes);
app.use('/', docsRoutes);
app.use('/webhook', webhookRoutes);

app.use(errorHandler);

seedCaseStudies().catch((err) => console.error('Seed failed:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
