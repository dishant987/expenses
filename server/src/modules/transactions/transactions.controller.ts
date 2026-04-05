import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types/index.js'
import * as txService from './transactions.service.js'

export async function listTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await txService.listTransactions(req.query as Record<string, string>)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body, userId: req.body.userId ?? req.user!.userId }
    const tx = await txService.createTransaction(data)
    res.status(201).json({ success: true, data: tx })
  } catch (err) {
    next(err)
  }
}

export async function updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const tx = await txService.updateTransaction(id, req.body)
    res.json({ success: true, data: tx })
  } catch (err) {
    next(err)
  }
}

export async function deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    await txService.softDeleteTransaction(id)
    res.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export async function bulkDeleteTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await txService.bulkSoftDeleteTransactions(ids)
    res.json({ success: true, message: 'Transactions deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export async function listDeletedTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await txService.listDeletedTransactions(req.query as any)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function restoreTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await txService.restoreTransactions(ids)
    res.json({ success: true, message: 'Transactions restored successfully' })
  } catch (err) {
    next(err)
  }
}

export async function permanentlyDeleteTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await txService.permanentlyDeleteTransactions(ids)
    res.json({ success: true, message: 'Transactions permanently deleted' })
  } catch (err) {
    next(err)
  }
}
