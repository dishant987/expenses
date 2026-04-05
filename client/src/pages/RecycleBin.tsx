import { useState } from 'react'
import { format } from 'date-fns'
import {
  Trash, RotateCcw, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  useDeletedTransactions,
  useRestoreTransactions,
  usePermanentDeleteTransactions,
  useDeletedUsers,
  useRestoreUsers,
  usePermanentDeleteUsers
} from '../hooks/useRecycleBin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function RecycleBin() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionType, setActionType] = useState<'restore' | 'permanently-delete' | null>(null)

  const [txPage, setTxPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  
  // Transactions
  const { data: txResponse, isLoading: loadingTxs } = useDeletedTransactions({ 
    page: txPage 
  })
  const deletedTxs = txResponse?.transactions ?? []
  const txMeta = txResponse?.meta
  
  const restoreTxs = useRestoreTransactions()
  const permDeleteTxs = usePermanentDeleteTransactions()

  // Users
  const { data: userResponse, isLoading: loadingUsers } = useDeletedUsers({ 
    page: userPage 
  })
  const deletedUsers = userResponse?.users ?? []
  const userMeta = userResponse?.meta
  
  const restoreUsers = useRestoreUsers()
  const permDeleteUsers = usePermanentDeleteUsers()

  const currentItems = activeTab === 'transactions' ? deletedTxs : deletedUsers

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(currentItems.map((item: any) => item.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAction = async () => {
    if (!actionType) return

    if (activeTab === 'transactions') {
      if (actionType === 'restore') {
        await restoreTxs.mutateAsync(selectedIds)
      } else {
        await permDeleteTxs.mutateAsync(selectedIds)
      }
    } else {
      if (actionType === 'restore') {
        await restoreUsers.mutateAsync(selectedIds)
      } else {
        await permDeleteUsers.mutateAsync(selectedIds)
      }
    }
    
    setSelectedIds([])
    setActionType(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Recycle Bin</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Restore deleted items or remove them permanently.</p>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 w-full sm:w-auto">
            <Button className='flex-1 sm:flex-none cursor-pointer' variant="outline" size="sm" onClick={() => setActionType('restore')}>
              <RotateCcw className="mr-2 h-4 w-4" /> 
              <span className="hidden xs:inline">Restore Selected</span>
              <span className="xs:hidden">Restore</span>
            </Button>
            <Button className='flex-1 sm:flex-none cursor-pointer' variant="destructive" size="sm" onClick={() => setActionType('permanently-delete')}>
              <Trash className="mr-2 h-4 w-4" /> 
              <span className="hidden xs:inline">Delete Permanently</span>
              <span className="xs:hidden">Delete</span>
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setSelectedIds([]) }}>
        <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="m-0">
          <Card>
            <CardHeader className="py-3 border-b px-4 sm:px-6 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-medium text-muted-foreground">
                  <span className="hidden sm:inline">{txMeta?.total ?? 0} deleted transactions</span>
                  <span className="sm:hidden">{txMeta?.total ?? 0} txs</span>
               </CardTitle>
               {txMeta && txMeta.totalPages > 1 && (
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] sm:text-xs text-muted-foreground">{txMeta.page}/{txMeta.totalPages}</span>
                   <div className="flex gap-1">
                     <Button variant="outline" size="icon" className="h-7 w-7" disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)}>
                       <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <Button variant="outline" size="icon" className="h-7 w-7" disabled={txPage >= txMeta.totalPages} onClick={() => setTxPage(p => p + 1)}>
                       <ChevronRight className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               )}
            </CardHeader>
            <CardContent className="p-0">
              {loadingTxs ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : deletedTxs?.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">The bin is empty.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-6 py-3 text-left w-10">
                          <Checkbox
                            className='cursor-pointer'
                            checked={selectedIds.length === deletedTxs.length && deletedTxs.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deleted At</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedTxs?.map((tx) => (
                        <tr key={tx.id} className={cn("border-b hover:bg-accent/20 transition-colors", selectedIds.includes(tx.id) && "bg-accent/40")}>
                          <td className="px-6 py-3">
                            <Checkbox className='cursor-pointer' checked={selectedIds.includes(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{tx.category}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.notes ?? 'No notes'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={tx.type === 'INCOME' ? 'outline' : 'destructive'} className="text-[10px] px-1.5 py-0">
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {tx.deletedAt ? format(new Date(tx.deletedAt), 'MMM d, yyyy HH:mm') : '—'}
                          </td>
                          <td className={cn("px-4 py-3 text-right text-sm font-mono font-semibold", tx.type === 'INCOME' ? "text-emerald-600" : "text-rose-600")}>
                            {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="m-0">
          <Card>
             <CardHeader className="py-3 border-b px-4 sm:px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <span className="hidden sm:inline">{userMeta?.total ?? 0} deleted users</span>
                  <span className="sm:hidden">{userMeta?.total ?? 0} users</span>
                </CardTitle>
                {userMeta && userMeta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{userMeta.page}/{userMeta.totalPages}</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={userPage >= userMeta.totalPages} onClick={() => setUserPage(p => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
             </CardHeader>
             <CardContent className="p-0">
              {loadingUsers ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : deletedUsers?.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">No deleted users.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-6 py-3 text-left w-10">
                          <Checkbox
                            checked={selectedIds.length === deletedUsers.length && deletedUsers.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deleted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedUsers?.map((u) => (
                        <tr key={u.id} className={cn("border-b hover:bg-accent/20 transition-colors", selectedIds.includes(u.id) && "bg-accent/40")}>
                          <td className="px-6 py-3">
                            <Checkbox checked={selectedIds.includes(u.id)} onCheckedChange={() => toggleSelect(u.id)} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{u.name}</span>
                              <span className="text-xs text-muted-foreground">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                             <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {u.deletedAt ? format(new Date(u.deletedAt), 'MMM d, yyyy HH:mm') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'restore' ? 'Restore Items' : 'Permanently Delete'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {actionType === 'restore' 
              ? `Are you sure you want to restore ${selectedIds.length} items? They will reappear in the main lists.`
              : `Are you sure you want to permanently delete ${selectedIds.length} items? This action is IRREVERSIBLE.`
            }
          </p>
          <DialogFooter className="mt-4 gap-2 border-t pt-4">
            <Button className='cursor-pointer' variant="outline" size="sm" onClick={() => setActionType(null)}>Cancel</Button>
            <Button 
              size="sm"
              className='cursor-pointer'
              variant={actionType === 'restore' ? 'default' : 'destructive'} 
              onClick={handleAction}
              disabled={restoreTxs.isPending || permDeleteTxs.isPending || restoreUsers.isPending || permDeleteUsers.isPending}
            >
              {(restoreTxs.isPending || permDeleteTxs.isPending || restoreUsers.isPending || permDeleteUsers.isPending) && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {actionType === 'restore' ? 'Restore' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
