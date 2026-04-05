import { Router } from 'express'
import { 
  listTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  bulkDeleteTransactions,
  listDeletedTransactions,
  restoreTransactions,
  permanentlyDeleteTransactions
} from './transactions.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  bulkDeleteTransactionsSchema,
} from './transactions.schema.js'

const router = Router()
router.use(authenticate)

router.get('/', validate(listTransactionsQuerySchema, 'query'), listTransactions)
router.post('/', requireRole('ADMIN'), validate(createTransactionSchema), createTransaction)
router.post('/bulk-delete', requireRole('ADMIN'), validate(bulkDeleteTransactionsSchema), bulkDeleteTransactions)
router.get('/deleted', requireRole('ADMIN'), listDeletedTransactions)
router.post('/restore', requireRole('ADMIN'), validate(bulkDeleteTransactionsSchema), restoreTransactions)
router.delete('/permanent', requireRole('ADMIN'), validate(bulkDeleteTransactionsSchema), permanentlyDeleteTransactions)
router.patch('/:id', requireRole('ADMIN'), validate(updateTransactionSchema), updateTransaction)
router.delete('/:id', requireRole('ADMIN'), deleteTransaction)

export default router
