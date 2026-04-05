import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type ValidateTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      // Zod v4 uses `.issues`, Zod v3 uses `.errors` — support both
      const rawIssues = (result.error as any).issues ?? (result.error as any).errors ?? []
      const errors = rawIssues.map((e: { path: (string | number)[]; message: string }) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      res.status(422).json({ success: false, message: 'Validation failed', errors })
      return
    }
    req[target] = result.data
    next()
  }
}
