import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e: ZodError['errors'][number]) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors,
      });
      return;
    }

    req[source] = result.data;
    next();
  };
};
