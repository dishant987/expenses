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

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

// Security & Logging
app.use(helmet())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  console.log(`🌍 Allowed origins:`, allowedOrigins)
})

export default app