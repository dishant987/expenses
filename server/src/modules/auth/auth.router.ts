import { Router } from 'express'
import { register, login, me } from './auth.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { registerSchema, loginSchema } from './auth.schema.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/me', authenticate, me)

export default router
