import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'UPDATE_USER':
      return { ...state, user: action.payload }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('finance_token')
    const userJson = localStorage.getItem('finance_user')
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        dispatch({ type: 'SET_AUTH', payload: { user, token } })
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const setAuth = (user: User, token: string) => {
    localStorage.setItem('finance_token', token)
    localStorage.setItem('finance_user', JSON.stringify(user))
    dispatch({ type: 'SET_AUTH', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('finance_token')
    localStorage.removeItem('finance_user')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthStore() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthStore must be used within AuthProvider')
  return ctx
}
