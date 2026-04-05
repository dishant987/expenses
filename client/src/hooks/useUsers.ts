import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import type { User, PaginatedResponse } from '../types'

interface UserFilters {
  page?: number
  limit?: number
  role?: string
  status?: string
  search?: string
}

export function useUsers(filters: UserFilters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== 'all' && v !== undefined)
  )
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>('/users', { params })
      return res.data
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      api.post('/users', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      api.patch(`/users/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update user')
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete user')
    },
  })
}

export function useBulkDeleteUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.post('/users/bulk-delete', { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Users deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete users')
    },
  })
}
