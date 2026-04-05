import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, Search, Loader2, ChevronLeft, ChevronRight, Shield, Trash } from 'lucide-react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useBulkDeleteUsers } from '../hooks/useUsers'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
  ANALYST: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  VIEWER: 'bg-muted text-muted-foreground',
}

interface UserForm {
  name: string
  email: string
  password: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'VIEWER', status: 'ACTIVE' }

export default function Users() {
  const { user: me } = useAuthStore()
  const isAdmin = me?.role === 'ADMIN'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useUsers({ page, limit: 15, role: roleFilter, search: debouncedSearch })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const bulkDeleteMutation = useBulkDeleteUsers()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (u: User) => {
    setEditingUser(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role, status: u.status })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (editingUser) {
      const updateData: any = { name: form.name, email: form.email, role: form.role, status: form.status }
      await updateMutation.mutateAsync({ id: editingUser.id, data: updateData })
    } else {
      await createMutation.mutateAsync({ name: form.name, email: form.email, password: form.password, role: form.role })
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

  const users = data?.users ?? []
  const meta = data?.meta

  const selectableUsers = users.filter(u => u.id !== me?.id)

  const toggleSelectAll = () => {
    if (selectedIds.length === selectableUsers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(selectableUsers.map(u => u.id))
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
            id="user-search"
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-36 cursor-pointer" id="role-filter">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className='cursor-pointer'>All Roles</SelectItem>
            <SelectItem value="ADMIN" className='cursor-pointer'>Admin</SelectItem>
            <SelectItem value="ANALYST" className='cursor-pointer'>Analyst</SelectItem>
            <SelectItem value="VIEWER" className='cursor-pointer'>Viewer</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                id="bulk-delete-users-btn"
                size="sm"
                className="flex-1 sm:flex-none h-9 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Delete ({selectedIds.length})</span>
                <span className="xs:hidden">{selectedIds.length}</span>
              </Button>
            )}
            <Button onClick={openCreate} id="create-user-btn" className='flex-1 sm:flex-none cursor-pointer'>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Add User</span>
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
                <span className="hidden sm:inline">{meta.total} total users</span>
                <span className="sm:hidden">{meta.total} users</span>
              </>
            ) : 'Users'}
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
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {isAdmin && (
                      <th className="px-4 py-3 text-left w-10">
                        <Checkbox
                          id="select-all-users"
                          className='cursor-pointer'
                          checked={selectableUsers.length > 0 && selectedIds.length === selectableUsers.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</th>
                    {isAdmin && <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id} className={cn('border-b border-border/50 hover:bg-accent/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10', selectedIds.includes(u.id) && 'bg-accent/50')}>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {u.id !== me?.id && (
                            <Checkbox
                              id={`select-user-${u.id}`}
                              className='cursor-pointer'
                              checked={selectedIds.includes(u.id)}
                              onCheckedChange={() => toggleSelect(u.id)}
                            />
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn('text-xs font-medium', roleColors[u.role])}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'} className={cn('text-xs', u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100' : '')}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => openEdit(u)} id={`edit-user-${u.id}`} disabled={u.id === me?.id}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer" onClick={() => setDeleteId(u.id)} id={`delete-user-${u.id}`} disabled={u.id === me?.id}>
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
            <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
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
            <Button  variant="outline" size="icon" className="h-8 w-8 cursor-pointer" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input id="user-name" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {!editingUser && (
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input id="user-password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="user-role">Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as any }))}>
                  <SelectTrigger id="user-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="ANALYST">Analyst</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser && (
                <div className="space-y-1.5">
                  <Label htmlFor="user-status">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                    <SelectTrigger id="user-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || !form.email || (!editingUser && !form.password) || createMutation.isPending || updateMutation.isPending}
              id="save-user-btn"
              className='cursor-pointer'
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this user? All their transactions will be affected.</p>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button className='cursor-pointer' variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} id="confirm-delete-user">
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Users</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete {selectedIds.length} selected users? This action cannot be undone.</p>
          <DialogFooter>
            <Button className='cursor-pointer' variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
            <Button className='cursor-pointer' variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending} id="confirm-bulk-delete-users">
              {bulkDeleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete {selectedIds.length} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
