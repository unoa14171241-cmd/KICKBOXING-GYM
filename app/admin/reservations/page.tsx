'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Calendar, Search, Filter, Check, X, Clock, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Reservation {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  member: {
    firstName: string
    lastName: string
    memberNumber: string
  }
  trainer: {
    firstName: string
    lastName: string
  }
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations')
      const data = await res.json()
      setReservations(data.reservations || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        fetchReservations()
        setShowModal(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.member.firstName.includes(searchQuery) ||
      r.member.lastName.includes(searchQuery) ||
      r.member.memberNumber.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-900" style={{ fontFamily: 'var(--font-bebas)' }}>
              RESERVATIONS
            </h1>
            <p className="text-dark-400">予約管理</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <Input
                placeholder="会員名、会員番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">すべてのステータス</option>
              <option value="confirmed">確定</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
              <option value="no_show">欠席</option>
            </select>
          </div>
        </Card>

        {/* Reservations Table */}
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
                    <th>日時</th>
                    <th>会員</th>
                    <th>トレーナー</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>
                          <div>
                            <p className="text-dark-900 font-medium">{formatDate(reservation.date)}</p>
                            <p className="text-sm text-dark-400">
                              {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="text-dark-900">
                              {reservation.member.lastName} {reservation.member.firstName}
                            </p>
                            <p className="text-xs text-dark-400">{reservation.member.memberNumber}</p>
                          </div>
                        </td>
                        <td>
                          <span className="text-dark-300">
                            {reservation.trainer.lastName} {reservation.trainer.firstName}
                          </span>
                        </td>
                        <td>
                          <Badge status={reservation.status} />
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {reservation.status === 'confirmed' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateReservationStatus(reservation.id, 'completed')}
                                >
                                  <Check className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateReservationStatus(reservation.id, 'no_show')}
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReservation(reservation)
                                setShowModal(true)
                              }}
                            >
                              詳細
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                        <p className="text-dark-400">予約が見つかりません</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="予約詳細"
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-400">日付</p>
                <p className="text-dark-900">{formatDate(selectedReservation.date)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">時間</p>
                <p className="text-dark-900">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">会員</p>
                <p className="text-dark-900">{selectedReservation.member.lastName} {selectedReservation.member.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">トレーナー</p>
                <p className="text-dark-900">{selectedReservation.trainer.lastName} {selectedReservation.trainer.firstName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-2">ステータス変更</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}>
                  確定
                </Button>
                <Button size="sm" variant="secondary" onClick={() => updateReservationStatus(selectedReservation.id, 'completed')}>
                  完了
                </Button>
                <Button size="sm" variant="secondary" onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}>
                  キャンセル
                </Button>
                <Button size="sm" variant="secondary" onClick={() => updateReservationStatus(selectedReservation.id, 'no_show')}>
                  欠席
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}
