'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Calendar, Clock, User, X, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Reservation {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  trainer: {
    firstName: string
    lastName: string
  }
  isRescheduled: boolean
}

function ReservationsContent() {
  const searchParams = useSearchParams()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations')
      const data = await res.json()
      setReservations(data.reservations || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedReservation) return

    try {
      const res = await fetch(`/api/reservations/${selectedReservation.id}/cancel`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchReservations()
        setShowCancelModal(false)
        setSelectedReservation(null)
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      alert('キャンセル処理に失敗しました')
    }
  }

  const upcomingReservations = reservations.filter(
    r => new Date(r.date) >= new Date() && r.status === 'confirmed'
  )
  const pastReservations = reservations.filter(
    r => new Date(r.date) < new Date() || r.status !== 'confirmed'
  )

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              RESERVATIONS
            </h1>
            <p className="text-dark-400">予約一覧</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400">予約が完了しました！</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Reservations */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                今後の予約
              </h2>

              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 animate-fadeIn"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex flex-col items-center justify-center">
                            <span className="text-xs text-primary-400">
                              {new Date(reservation.date).toLocaleDateString('ja-JP', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-white">
                              {new Date(reservation.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {formatDate(reservation.date)}
                            </p>
                            <p className="text-sm text-dark-400 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {reservation.startTime} - {reservation.endTime}
                            </p>
                            <p className="text-sm text-dark-400 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {reservation.trainer.lastName} {reservation.trainer.firstName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {reservation.isRescheduled && (
                            <Badge variant="info">振替</Badge>
                          )}
                          <Badge status={reservation.status} />
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReservation(reservation)
                                setShowCancelModal(true)
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">今後の予約はありません</p>
                </div>
              )}
            </Card>

            {/* Past Reservations */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-dark-400" />
                過去の予約
              </h2>

              {pastReservations.length > 0 ? (
                <div className="space-y-4">
                  {pastReservations.slice(0, 10).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-dark-700/50 flex flex-col items-center justify-center">
                            <span className="text-xs text-dark-500">
                              {new Date(reservation.date).toLocaleDateString('ja-JP', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-dark-400">
                              {new Date(reservation.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-dark-300">
                              {formatDate(reservation.date)}
                            </p>
                            <p className="text-sm text-dark-500">
                              {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                        </div>
                        <Badge status={reservation.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dark-400">過去の予約はありません</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="予約をキャンセル"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            この予約をキャンセルしてもよろしいですか？
          </p>
          {selectedReservation && (
            <div className="p-4 rounded-xl bg-dark-800/50 space-y-2">
              <p className="text-white">{formatDate(selectedReservation.date)}</p>
              <p className="text-dark-400">
                {selectedReservation.startTime} - {selectedReservation.endTime}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              戻る
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              キャンセルする
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    }>
      <ReservationsContent />
    </Suspense>
  )
}
