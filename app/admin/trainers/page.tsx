'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { UserCog, Plus, Edit, Trash2, Search, User } from 'lucide-react'

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string | null
  bio: string | null
  isActive: boolean
  user: {
    email: string
  }
}

const emptyTrainer = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  specialization: '',
  bio: '',
  isActive: true,
}

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(emptyTrainer)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      const res = await fetch('/api/admin/trainers')
      const data = await res.json()
      setTrainers(data.trainers || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/admin/trainers/${editingTrainer.id}` : '/api/admin/trainers'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTrainer),
      })

      if (res.ok) {
        fetchTrainers()
        setShowModal(false)
        setEditingTrainer(emptyTrainer)
      } else {
        const data = await res.json()
        alert(data.error || 'エラーが発生しました')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このトレーナーを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/trainers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTrainers()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openCreateModal = () => {
    setEditingTrainer(emptyTrainer)
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer({
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.user.email,
      password: '',
      specialization: trainer.specialization || '',
      bio: trainer.bio || '',
      isActive: trainer.isActive,
    })
    setIsEditing(true)
    setShowModal(true)
  }

  const filteredTrainers = trainers.filter(t =>
    t.firstName.includes(searchQuery) ||
    t.lastName.includes(searchQuery) ||
    t.user.email.includes(searchQuery)
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              TRAINERS
            </h1>
            <p className="text-dark-400">トレーナー管理</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            新規トレーナー
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="名前、メールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </Card>

        {/* Trainers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : filteredTrainers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hoverable>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-orange/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-500" />
                    </div>
                    <Badge variant={trainer.isActive ? 'success' : 'danger'}>
                      {trainer.isActive ? 'アクティブ' : '非アクティブ'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {trainer.lastName} {trainer.firstName}
                  </h3>
                  <p className="text-dark-400 text-sm mb-2">{trainer.user.email}</p>
                  {trainer.specialization && (
                    <p className="text-primary-400 text-sm mb-3">{trainer.specialization}</p>
                  )}
                  {trainer.bio && (
                    <p className="text-dark-400 text-sm mb-4 line-clamp-2">{trainer.bio}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(trainer)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      編集
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(trainer.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <UserCog className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">トレーナーが見つかりません</p>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'トレーナーを編集' : '新規トレーナー'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="姓"
              value={editingTrainer.lastName}
              onChange={(e) => setEditingTrainer({ ...editingTrainer, lastName: e.target.value })}
              required
            />
            <Input
              label="名"
              value={editingTrainer.firstName}
              onChange={(e) => setEditingTrainer({ ...editingTrainer, firstName: e.target.value })}
              required
            />
          </div>
          <Input
            label="メールアドレス"
            type="email"
            value={editingTrainer.email}
            onChange={(e) => setEditingTrainer({ ...editingTrainer, email: e.target.value })}
            required
            disabled={isEditing}
          />
          {!isEditing && (
            <Input
              label="パスワード"
              type="password"
              value={editingTrainer.password}
              onChange={(e) => setEditingTrainer({ ...editingTrainer, password: e.target.value })}
              required
            />
          )}
          <Input
            label="専門分野"
            value={editingTrainer.specialization}
            onChange={(e) => setEditingTrainer({ ...editingTrainer, specialization: e.target.value })}
            placeholder="例: キックボクシング、ムエタイ"
          />
          <div>
            <label className="input-label">自己紹介</label>
            <textarea
              className="input min-h-[100px]"
              value={editingTrainer.bio}
              onChange={(e) => setEditingTrainer({ ...editingTrainer, bio: e.target.value })}
              placeholder="経歴や得意分野など"
            />
          </div>
          <div>
            <label className="input-label">ステータス</label>
            <select
              className="input"
              value={editingTrainer.isActive ? 'true' : 'false'}
              onChange={(e) => setEditingTrainer({ ...editingTrainer, isActive: e.target.value === 'true' })}
            >
              <option value="true">アクティブ</option>
              <option value="false">非アクティブ</option>
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
