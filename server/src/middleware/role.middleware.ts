import { Response, NextFunction } from 'express'
import { AuthRequest, Role } from '../types/index.js'

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      })
      return
    }
    next()
  }
}
