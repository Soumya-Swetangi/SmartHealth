import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed for one or more fields',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
    return;
  }
  next();
};
