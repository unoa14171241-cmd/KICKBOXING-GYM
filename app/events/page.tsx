'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, Button, Badge } from '@/components/ui'
import { CalendarDays, MapPin, Clock, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string
  endTime: string
  location: string | null
  capacity: number | null
  price: number
  eventType: string
  _count?: {
    registrations: number
  }
}

const eventTypeLabels: Record<string, string> = {
  seminar: 'セミナー',
  competition: '大会',
  workshop: 'ワークショップ',
  social: '交流会',
}

const eventTypeColors: Record<string, string> = {
  seminar: 'bg-blue-100 text-blue-700',
  competition: 'bg-red-100 text-red-700',
  workshop: 'bg-green-100 text-green-700',
  social: 'bg-purple-100 text-purple-700',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        if (!res.ok) throw new Error('イベント情報の取得に失敗しました')
        const data = await res.json()
        setEvents(data)
      } catch (err) {
        setError('イベント情報を取得できませんでした')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'competition':
        return Trophy
      default:
        return CalendarDays
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            EVENTS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            イベント・セミナー情報
          </motion.p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">現在予定されているイベントはありません</p>
              <p className="text-gray-400 text-sm mt-2">新しいイベントが追加されるまでお待ちください</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => {
                const EventIcon = getEventIcon(event.eventType)
                const remainingSpots = event.capacity 
                  ? event.capacity - (event._count?.registrations || 0)
                  : null

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hoverable className="h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                          <EventIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <Badge className={eventTypeColors[event.eventType] || 'bg-gray-100 text-gray-700'}>
                          {eventTypeLabels[event.eventType] || event.eventType}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              定員 {event.capacity}名
                              {remainingSpots !== null && remainingSpots > 0 && (
                                <span className="text-primary-500 ml-1">
                                  （残り{remainingSpots}名）
                                </span>
                              )}
                              {remainingSpots !== null && remainingSpots <= 0 && (
                                <span className="text-red-500 ml-1">（満員）</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {event.price === 0 ? '無料' : formatCurrency(event.price)}
                        </span>
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm">
                            詳細を見る
                            <ArrowRight className="ml-1 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
