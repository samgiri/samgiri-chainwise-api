import { Request, Response, NextFunction } from 'express';

export const rateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    const userRequests = (requests.get(ip) || []).filter((time) => now - time < windowMs);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
  };
};
