'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Users, Search, Plus, Filter, MoreVertical,
  Mail, Phone, Calendar, Edit, Trash2, Eye,
  CheckCircle2, History
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'

interface VisitLog {
  id: string
  memberId: string
  checkedInAt: string
  method: string
  notes?: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  memberNumber: string
  status: string
  remainingSessions: number
  joinedAt: string
  plan: {
    name: string
    price: number
  } | null
  store: {
    id: string
    name: string
  } | null
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // 来店履歴モーダル用
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVisitHistory = async (member: Member) => {
    try {
      setSelectedMember(member)
      setIsHistoryOpen(true)
      const res = await fetch(`/api/members/${member.id}/visits`)
      if (res.ok) {
        const data = await res.json()
        setVisitLogs(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-900" style={{ fontFamily: 'var(--font-bebas)' }}>
              MEMBERS
            </h1>
            <p className="text-dark-400">会員管理</p>
          </div>
          <Link href="/admin/members/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              新規会員登録
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <Input
                placeholder="名前、会員番号、メールで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">すべてのステータス</option>
                <option value="active">アクティブ</option>
                <option value="suspended">休会中</option>
                <option value="cancelled">退会</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Members Table */}
        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>会員</th>
                    <th>会員番号</th>
                    <th>所属店舗</th>
                    <th>プラン</th>
                    <th>残りセッション</th>
                    <th>ステータス</th>
                    <th>入会日</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div>
                            <p className="font-medium text-dark-900">
                              {member.lastName} {member.firstName}
                            </p>
                            <p className="text-xs text-dark-400">{member.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-dark-300">{member.memberNumber}</span>
                        </td>
                        <td>
                          {member.store ? (
                            <span className="text-dark-900">{member.store.name}</span>
                          ) : (
                            <span className="text-dark-400">未設定</span>
                          )}
                        </td>
                        <td>
                          {member.plan ? (
                            <div>
                              <p className="text-dark-900">{member.plan.name}</p>
                              <p className="text-xs text-dark-400">
                                {formatCurrency(member.plan.price)}/月
                              </p>
                            </div>
                          ) : (
                            <span className="text-dark-400">未設定</span>
                          )}
                        </td>
                        <td>
                          <span className="text-dark-900">{member.remainingSessions}回</span>
                        </td>
                        <td>
                          <Badge status={member.status} />
                        </td>
                        <td>
                          <span className="text-dark-400">{formatDate(member.joinedAt)}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchVisitHistory(member)}
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                              title="来店履歴"
                            >
                              <History className="w-4 h-4 text-dark-400" />
                            </button>
                            <Link
                              href={`/admin/members/${member.id}`}
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-dark-400" />
                            </Link>
                            <Link
                              href={`/admin/members/${member.id}/edit`}
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-dark-400" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                        <p className="text-dark-400">会員が見つかりません</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Visit History Modal */}
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          title={`来店履歴: ${selectedMember?.lastName} ${selectedMember?.firstName}`}
          size="lg"
        >
          <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
            {visitLogs.length > 0 ? (
              <div className="space-y-4">
                {visitLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-dark-700/50 border border-dark-700">
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-dark-200">
                          {formatDateTime(log.checkedInAt)}
                        </p>
                        <Badge status={log.method === 'qr' ? 'active' : 'secondary'}>
                          {log.method === 'qr' ? 'QRCheckin' : 'Manual'}
                        </Badge>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-dark-400 mt-2 bg-dark-800/50 p-2 rounded">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">
                <p>来店履歴はありません</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}
