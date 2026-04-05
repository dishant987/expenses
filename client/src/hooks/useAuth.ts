import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { AuthData } from '../types'

export function useAuth() {
  const auth = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: AuthData }>('/auth/login', { email, password })
    auth.setAuth(res.data.data.user, res.data.data.token)
    toast.success(`Welcome back, ${res.data.data.user.name}!`)
    navigate('/dashboard')
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: AuthData }>('/auth/register', { name, email, password })
    auth.setAuth(res.data.data.user, res.data.data.token)
    toast.success('Account created successfully!')
    navigate('/dashboard')
  }

  const logout = () => {
    auth.logout()
    toast.info('Logged out')
    navigate('/login')
  }

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login,
    register,
    logout,
  }
}
