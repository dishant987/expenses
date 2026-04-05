import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types/index.js'
import * as dashboardService from './dashboard.service.js'

export async function summary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getSummary()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function trends(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTrends()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function categories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getCategories()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function recent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const data = await dashboardService.getRecent(limit)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
