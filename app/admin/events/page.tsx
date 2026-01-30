'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CalendarDays, Plus, Edit, Trash2, Search, Users } from 'lucide-react'
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
  isPublished: boolean
  _count?: {
    registrations: number
  }
}

const eventTypes = [
  { id: 'seminar', label: 'セミナー' },
  { id: 'competition', label: '大会' },
  { id: 'workshop', label: 'ワークショップ' },
  { id: 'social', label: '交流会' },
]

const emptyEvent = {
  id: '',
  title: '',
  description: '',
  date: '',
  startTime: '10:00',
  endTime: '12:00',
  location: '',
  capacity: 20,
  price: 0,
  eventType: 'seminar',
  isPublished: false,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(emptyEvent)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent),
      })

      if (res.ok) {
        fetchEvents()
        setShowModal(false)
        setEditingEvent(emptyEvent)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openCreateModal = () => {
    setEditingEvent(emptyEvent)
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      capacity: event.capacity || 20,
      price: event.price,
      eventType: event.eventType,
      isPublished: event.isPublished,
    })
    setIsEditing(true)
    setShowModal(true)
  }

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              EVENTS
            </h1>
            <p className="text-dark-400">イベント管理</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            新規イベント
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="イベント名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </Card>

        {/* Events Table */}
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
                    <th>イベント名</th>
                    <th>日時</th>
                    <th>種類</th>
                    <th>参加者</th>
                    <th>価格</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div>
                            <p className="text-white font-medium">{event.title}</p>
                            {event.location && (
                              <p className="text-xs text-dark-400">{event.location}</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="text-white">{formatDate(event.date)}</p>
                            <p className="text-xs text-dark-400">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="text-dark-300">
                            {eventTypes.find(t => t.id === event.eventType)?.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-white">
                            {event._count?.registrations || 0}
                            {event.capacity && `/${event.capacity}`}
                          </span>
                        </td>
                        <td>
                          <span className="text-white">
                            {event.price === 0 ? '無料' : formatCurrency(event.price)}
                          </span>
                        </td>
                        <td>
                          <Badge variant={event.isPublished ? 'success' : 'warning'}>
                            {event.isPublished ? '公開中' : '下書き'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditModal(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <CalendarDays className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                        <p className="text-dark-400">イベントが見つかりません</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'イベントを編集' : '新規イベント'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="イベント名"
            value={editingEvent.title}
            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
            required
          />
          <div>
            <label className="input-label">説明</label>
            <textarea
              className="input min-h-[100px]"
              value={editingEvent.description}
              onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="日付"
              type="date"
              value={editingEvent.date}
              onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
              required
            />
            <Input
              label="開始時間"
              type="time"
              value={editingEvent.startTime}
              onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
              required
            />
            <Input
              label="終了時間"
              type="time"
              value={editingEvent.endTime}
              onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
              required
            />
          </div>
          <Input
            label="場所"
            value={editingEvent.location}
            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">イベント種類</label>
              <select
                className="input"
                value={editingEvent.eventType}
                onChange={(e) => setEditingEvent({ ...editingEvent, eventType: e.target.value })}
              >
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="定員"
              type="number"
              value={editingEvent.capacity || ''}
              onChange={(e) => setEditingEvent({ ...editingEvent, capacity: parseInt(e.target.value) || null })}
            />
            <Input
              label="参加費（円）"
              type="number"
              value={editingEvent.price}
              onChange={(e) => setEditingEvent({ ...editingEvent, price: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="input-label">公開設定</label>
            <select
              className="input"
              value={editingEvent.isPublished ? 'true' : 'false'}
              onChange={(e) => setEditingEvent({ ...editingEvent, isPublished: e.target.value === 'true' })}
            >
              <option value="false">下書き</option>
              <option value="true">公開</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? '更新' : '作成'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
