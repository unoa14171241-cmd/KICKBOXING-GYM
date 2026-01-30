'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, Button, Badge } from '@/components/ui'
import { CalendarDays, MapPin, Clock, Users, Trophy, ArrowRight } from 'lucide-react'
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

// デモイベントデータ
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'キックボクシング入門セミナー',
    description: '初心者向けのキックボクシング基礎セミナーです。基本的なスタンスやパンチ、キックの打ち方を学びます。',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '14:00',
    endTime: '16:00',
    location: 'BLAZE GYM メインスタジオ',
    capacity: 20,
    price: 0,
    eventType: 'seminar',
    _count: { registrations: 8 },
  },
  {
    id: '2',
    title: 'スパーリング大会',
    description: '会員同士でのスパーリング大会。経験レベルに応じたマッチングで安全に試合を楽しめます。',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '10:00',
    endTime: '17:00',
    location: 'BLAZE GYM メインスタジオ',
    capacity: 30,
    price: 3000,
    eventType: 'competition',
    _count: { registrations: 15 },
  },
  {
    id: '3',
    title: 'ミット打ちワークショップ',
    description: 'プロトレーナーによるミット打ちの実践ワークショップ。コンビネーションの組み立て方を学びます。',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '19:00',
    endTime: '21:00',
    location: 'BLAZE GYM メインスタジオ',
    capacity: 15,
    price: 2000,
    eventType: 'workshop',
    _count: { registrations: 10 },
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(demoEvents)

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events && data.events.length > 0) {
          setEvents(data.events)
        }
      })
      .catch(() => {
        // APIエラー時はデモデータを使用
      })
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 pattern-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            EVENTS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark-400"
          >
            セミナー、大会、ワークショップなど様々なイベントを開催
          </motion.p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length > 0 ? (
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
                      <div className="md:w-48 h-48 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-orange/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-16 h-16 text-primary-500" />
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
                              {event._count?.registrations || 0}/{event.capacity}名
                            </span>
                          )}
                        </div>

                        <Link href="/login">
                          <Button size="sm">
                            参加申込
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
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
      </section>

      <Footer />
    </div>
  )
}
