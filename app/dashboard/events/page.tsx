'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, Badge, Modal } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CalendarDays, MapPin, Clock, Users, Trophy, CheckCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  date: string
  startTime: string
  endTime: string
  location: string | null
  capacity: number | null
  price: number
  eventType: string
  _count: {
    registrations: number
  }
}

const eventTypeLabels: Record<string, string> = {
  seminar: 'セミナー',
  competition: '大会',
  workshop: 'ワークショップ',
  social: '交流会',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!selectedEvent) return

    setIsRegistering(true)
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('イベントに登録しました！')
        setShowModal(false)
        fetchEvents()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      alert('登録処理に失敗しました')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
            EVENTS
          </h1>
          <p className="text-dark-400">イベント一覧</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Event Image */}
                    <div className="md:w-48 h-48 rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="w-16 h-16 text-dark-500" />
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <Badge variant="info" className="mb-2">
                            {eventTypeLabels[event.eventType] || event.eventType}
                          </Badge>
                          <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">
                            {event.price === 0 ? '無料' : formatCurrency(event.price)}
                          </span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-dark-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-dark-400 mb-4">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4 text-primary-500" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {event.startTime} - {event.endTime}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            {event.location}
                          </span>
                        )}
                        {event.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-primary-500" />
                            {event._count.registrations}/{event.capacity}名
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowModal(true)
                        }}
                        disabled={event.capacity !== null && event._count.registrations >= event.capacity}
                      >
                        {event.capacity !== null && event._count.registrations >= event.capacity
                          ? '定員に達しました'
                          : '参加申込'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CalendarDays className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">現在予定されているイベントはありません</p>
          </Card>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="イベント参加申込"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-dark-800/50">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedEvent.title}</h3>
              <div className="space-y-2 text-sm text-dark-400">
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(selectedEvent.date)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
                {selectedEvent.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-dark-400">参加費</span>
              <span className="text-xl font-bold text-white">
                {selectedEvent.price === 0 ? '無料' : formatCurrency(selectedEvent.price)}
              </span>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                キャンセル
              </Button>
              <Button onClick={handleRegister} isLoading={isRegistering}>
                <CheckCircle className="w-5 h-5 mr-2" />
                参加申込する
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
