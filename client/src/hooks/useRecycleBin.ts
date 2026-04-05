import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import type { Transaction, User, PaginatedResponse } from '../types'

export function useDeletedTransactions(filters: { page?: number; limit?: number } = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null)
  )
  return useQuery({
    queryKey: ['transactions', 'deleted', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Transaction>>('/transactions/deleted', { params })
      return res.data
    },
  })
}

export function useRestoreTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.post('/transactions/restore', { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transactions restored successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to restore')
    },
  })
}

export function usePermanentDeleteTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.delete('/transactions/permanent', { data: { ids } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', 'deleted'] })
      toast.success('Items permanently deleted')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete permanently')
    },
  })
}

export function useDeletedUsers(filters: { page?: number; limit?: number } = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null)
  )
  return useQuery({
    queryKey: ['users', 'deleted', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>('/users/deleted', { params })
      return res.data
    },
  })
}

export function useRestoreUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.post('/users/restore', { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Users restored successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to restore')
    },
  })
}

export function usePermanentDeleteUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.delete('/users/permanent', { data: { ids } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'deleted'] })
      toast.success('Users permanently deleted')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete permanently')
    },
  })
}
