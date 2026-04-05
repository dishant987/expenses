import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { DashboardSummary, TrendItem, CategoryItem, Transaction, ApiResponse } from '../types'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
      return res.data.data
    },
  })
}

export function useDashboardTrends() {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrendItem[]>>('/dashboard/trends')
      return res.data.data
    },
  })
}

export function useDashboardCategories() {
  return useQuery({
    queryKey: ['dashboard', 'categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CategoryItem[]>>('/dashboard/categories')
      return res.data.data
    },
  })
}

export function useDashboardRecent() {
  return useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Transaction[]>>('/dashboard/recent')
      return res.data.data
    },
  })
}
