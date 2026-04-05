import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Loader2, Trash
} from 'lucide-react'
import {
  useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useBulkDeleteTransactions
} from '../hooks/useTransactions'
import { useAuthStore } from '../store/authStore'
import type { Transaction } from '../types'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val))
}

interface TxForm {
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes: string
  userId: string
}

const emptyForm: TxForm = { amount: '', type: 'INCOME', category: '', date: '', notes: '', userId: '' }

const CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Rental Income', 'Dividends',
  'Food & Dining', 'Transportation', 'Utilities', 'Healthcare', 'Shopping', 'Entertainment', 'Housing', 'Education', 'Other']

export default function Transactions() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | 'INCOME' | 'EXPENSE'>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useTransactions({
    page,
    limit: 15,
    type: typeFilter,
    category: categoryFilter,
    search: debouncedSearch,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  })

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const bulkDeleteMutation = useBulkDeleteTransactions()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [form, setForm] = useState<TxForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const openCreate = () => {
    setEditingTx(null)
    setForm({ ...emptyForm, userId: user?.id ?? '' })
    setDialogOpen(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setForm({
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date.split('T')[0],
      notes: tx.notes ?? '',
      userId: tx.userId,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      notes: form.notes || undefined,
      userId: form.userId || user?.id,
    }
    if (editingTx) {
      await updateMutation.mutateAsync({ id: editingTx.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload as any)
    }
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync(selectedIds)
    setSelectedIds([])
    setBulkDeleteDialogOpen(false)
  }

  const transactions = data?.transactions ?? []
  const meta = data?.meta

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(transactions.map(t => t.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="tx-search"
            placeholder="Search transactions..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DateRangePicker 
            date={dateRange} 
            setDate={(d) => { setDateRange(d); setPage(1) }} 
          />
          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as any); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-32 cursor-pointer" id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="all" className='cursor-pointer' >All Types</SelectItem>
                <SelectItem value="INCOME" className='cursor-pointer'>Income</SelectItem>
                <SelectItem value="EXPENSE" className='cursor-pointer'>Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-40 cursor-pointer" id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className='cursor-pointer'>All Categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c} className='cursor-pointer'>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                id="bulk-delete-btn"
                size="sm"
                className="flex-1 sm:flex-none h-9 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Delete ({selectedIds.length})</span>
                <span className="xs:hidden">{selectedIds.length}</span>
              </Button>
            )}
            <Button onClick={openCreate} id="create-tx-btn" className='flex-1 sm:flex-none cursor-pointer'>
              <Plus className="mr-2 h-4 w-4" /> 
              <span className="hidden xs:inline">Add Transaction</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="py-3 border-b px-4 sm:px-6 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {meta ? (
              <>
                <span className="hidden sm:inline">{meta.total} total transactions</span>
                <span className="sm:hidden">{meta.total} txs</span>
              </>
            ) : 'Transactions'}
          </CardTitle>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{meta.page}/{meta.totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7 cursor-pointer" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 cursor-pointer" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {isAdmin && (
                      <th className="px-4 py-3 text-left w-10">
                        <Checkbox
                          id="select-all"
                          className='cursor-pointer'
                          checked={transactions.length > 0 && selectedIds.length === transactions.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                    {isAdmin && <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id} className={cn('border-b border-border/50 hover:bg-accent/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10', selectedIds.includes(tx.id) && 'bg-accent/50')}>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <Checkbox
                            id={`select-${tx.id}`}
                            className='cursor-pointer'
                            checked={selectedIds.includes(tx.id)}
                            onCheckedChange={() => toggleSelect(tx.id)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{tx.category}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn('text-xs font-medium',
                            tx.type === 'INCOME'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400'
                          )}
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{tx.notes ?? '—'}</td>
                      <td className={cn('px-4 py-3 text-right text-sm font-semibold whitespace-nowrap',
                        tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      )}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => openEdit(tx)} id={`edit-tx-${tx.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer" onClick={() => setDeleteId(tx.id)} id={`delete-tx-${tx.id}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="order-2 sm:order-1">Showing page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-1 order-1 sm:order-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, meta.totalPages) }).map((_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 hidden xs:flex"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            })}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Amount (₹)</Label>
                <Input id="tx-amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-type">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                  <SelectTrigger id="tx-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tx-category">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger id="tx-category"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-date">Date</Label>
                <Input id="tx-date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-notes">Notes (optional)</Label>
              <Textarea id="tx-notes" placeholder="Add a note..." rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.amount || !form.category || !form.date || createMutation.isPending || updateMutation.isPending}
              id="save-tx-btn"
              className='cursor-pointer'
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingTx ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button className='cursor-pointer' variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} id="confirm-delete-tx">
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transactions</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {selectedIds.length} selected transactions? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
            <Button className='cursor-pointer' variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending} id="confirm-bulk-delete-tx">
              {bulkDeleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete {selectedIds.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
