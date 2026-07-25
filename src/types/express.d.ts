import 'express';

declare global {
  namespace Express {
    interface Request {
      apiKeyRecord?: {
        id: number;
        user_id: number;
        rate_limit: number;
        calls_today: number;
      };
    }
  }
}
