import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../../types/index.js'
import * as authService from './auth.service.js'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}
