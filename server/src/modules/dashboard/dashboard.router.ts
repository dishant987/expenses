import { Router } from 'express'
import { summary, trends, categories, recent } from './dashboard.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

const router = Router()
router.use(authenticate)

router.get('/summary', summary)
router.get('/trends', requireRole('ANALYST', 'ADMIN'), trends)
router.get('/categories', requireRole('ANALYST', 'ADMIN'), categories)
router.get('/recent', recent)

export default router
