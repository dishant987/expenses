import { Router } from 'express'
import { listUsers, createUser, updateUser, deleteUser, bulkDeleteUsers, listDeletedUsers, restoreUsers, permanentlyDeleteUsers } from './users.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { createUserSchema, updateUserSchema, listUsersQuerySchema, bulkDeleteUsersSchema } from './users.schema.js'

const router = Router()
router.use(authenticate)

router.get('/', requireRole('ADMIN', 'ANALYST'), validate(listUsersQuerySchema, 'query'), listUsers)
router.post('/', requireRole('ADMIN'), validate(createUserSchema), createUser)
router.post('/bulk-delete', requireRole('ADMIN'), validate(bulkDeleteUsersSchema), bulkDeleteUsers)
router.get('/deleted', requireRole('ADMIN'), listDeletedUsers)
router.post('/restore', requireRole('ADMIN'), validate(bulkDeleteUsersSchema), restoreUsers)
router.delete('/permanent', requireRole('ADMIN'), validate(bulkDeleteUsersSchema), permanentlyDeleteUsers)
router.patch('/:id', requireRole('ADMIN'), validate(updateUserSchema), updateUser)
router.delete('/:id', requireRole('ADMIN'), deleteUser)

export default router
