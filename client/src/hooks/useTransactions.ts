import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import type { Transaction, PaginatedResponse } from '../types'

interface TransactionFilters {
  page?: number
  limit?: number
  type?: 'INCOME' | 'EXPENSE' | ''
  category?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function useTransactions(filters: TransactionFilters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== 'all' && v !== undefined && v !== null)
  )
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Transaction>>('/transactions', { params })
      return res.data
    },
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post('/transactions', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create transaction')
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      api.patch(`/transactions/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update transaction')
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete transaction')
    },
  })
}

export function useBulkDeleteTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.post('/transactions/bulk-delete', { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transactions deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete transactions')
    },
  })
}
