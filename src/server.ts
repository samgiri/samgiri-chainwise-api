import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import subscribeRoutes from './routes/subscribe';
import analyzeRoutes from './routes/analyze';
import casesRoutes from './routes/cases';
import docsRoutes from './routes/docs';
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
app.use(rateLimit(10, 60000));

app.use('/api', healthRoutes);
app.use('/api', subscribeRoutes);
app.use('/api', analyzeRoutes);
app.use('/api', casesRoutes);
app.use('/', docsRoutes);

app.use(errorHandler);

seedCaseStudies().catch((err) => console.error('Seed failed:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
