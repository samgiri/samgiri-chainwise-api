import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
};
