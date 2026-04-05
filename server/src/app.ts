import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRouter from './modules/auth/auth.router.js'
import usersRouter from './modules/users/users.router.js'
import transactionsRouter from './modules/transactions/transactions.router.js'
import dashboardRouter from './modules/dashboard/dashboard.router.js'
import { errorHandler } from './middleware/error.middleware.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// Security & Logging
app.use(helmet())
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // Normalize origin and allowed list for comparison (remove trailing slashes)
      const normalizedOrigin = origin.replace(/\/$/, '')
      const isAllowed = allowedOrigins.some((allowed) => {
        const normalizedAllowed = allowed.replace(/\/$/, '')
        return normalizedAllowed === normalizedOrigin
      })

      if (isAllowed) {
        callback(null, true)
      } else {
        console.error(`Blocked by CORS: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/dashboard', dashboardRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

export default app
