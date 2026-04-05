import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import RecycleBin from './pages/RecycleBin'
import NotFound from './pages/NotFound'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected: All authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
              </Route>
            </Route>

            {/* Protected: Analyst + Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']} />}>
              <Route element={<Layout />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>

            {/* Protected: Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<Layout />}>
                <Route path="/recycle-bin" element={<RecycleBin />} />
              </Route>
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
