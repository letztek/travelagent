'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Trash2, Mail } from 'lucide-react'
import { inviteUserAction, revokeInvitationAction } from '@/app/auth/admin-actions'

interface UserListEntry {
  id: string
  email: string
  last_sign_in_at: string | null
  created_at: string
  status: 'invited' | 'joined'
  role: string
}

export default function UserManagementClient({ initialUsers }: { initialUsers: UserListEntry[] }) {
  const [users, setUsers] = useState<UserListEntry[]>(initialUsers)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setIsInviting(true)
    const result = await inviteUserAction(inviteEmail)
    setIsInviting(false)

    if (result.success) {
      alert('邀請已送出！')
      setInviteEmail('')
      window.location.reload()
    } else {
      alert(result.error || '邀請失敗')
    }
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm('確定要撤銷此邀請並刪除使用者嗎？此動作無法復原。')) return

    setIsRevoking(userId)
    const result = await revokeInvitationAction(userId)
    setIsRevoking(userId)

    if (result.success) {
      alert('已成功撤銷邀請。')
      setUsers(users.filter(u => u.id !== userId))
    } else {
      alert(result.error || '操作失敗')
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> 邀請新成員
          </CardTitle>
          <CardDescription>
            輸入 Email 以發送系統邀請郵件。受邀者將收到設定密碼的連結。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="email" 
                placeholder="user@example.com" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              傳送邀請
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>成員清單</CardTitle>
          <CardDescription>管理目前系統中的所有使用者及其權限狀態。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead>最後登入</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.status === 'joined' ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                      {user.status === 'joined' ? '已加入' : '等待中'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '尚未登入'}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => handleRevoke(user.id)}
                        disabled={isRevoking === user.id}
                      >
                        {isRevoking === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
