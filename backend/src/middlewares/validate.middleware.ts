import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guards any :id (or other) route param that must be a valid UUID before it
// reaches a DB query. Prevents "invalid input syntax for type uuid" 500s
// (e.g. when the frontend calls /admin/teams/undefined) and returns a
// clean 400 instead.
export const validateUUIDParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!value || !UUID_REGEX.test(value)) {
      res.status(400).json({
        success: false,
        message: `Invalid or missing ${paramName} parameter.`,
      });
      return;
    }
    next();
  };
};

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
