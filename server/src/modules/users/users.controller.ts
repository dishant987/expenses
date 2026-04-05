import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types/index.js'
import * as usersService from './users.service.js'

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await usersService.listUsers(req.query as Record<string, string>)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.createUser(req.body)
    res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const user = await usersService.updateUser(id, req.body)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    await usersService.softDeleteUser(id)
    res.json({ success: true, message: 'User moved to trash' })
  } catch (err) {
    next(err)
  }
}

export async function bulkDeleteUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await usersService.bulkSoftDeleteUsers(ids)
    res.json({ success: true, message: 'Users moved to trash' })
  } catch (err) {
    next(err)
  }
}

export async function listDeletedUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await usersService.listDeletedUsers(req.query as any)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function restoreUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await usersService.restoreUsers(ids)
    res.json({ success: true, message: 'Users restored successfully' })
  } catch (err) {
    next(err)
  }
}

export async function permanentlyDeleteUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body
    await usersService.permanentlyDeleteUsers(ids)
    res.json({ success: true, message: 'Users permanently deleted' })
  } catch (err) {
    next(err)
  }
}
