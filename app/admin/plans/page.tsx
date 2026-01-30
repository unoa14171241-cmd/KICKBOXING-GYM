'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CreditCard, Plus, Edit, Trash2, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  sessionsPerMonth: number
  durationMonths: number
  isActive: boolean
  sortOrder: number
  _count?: {
    members: number
  }
}

const emptyPlan = {
  id: '',
  name: '',
  description: '',
  price: 0,
  sessionsPerMonth: 4,
  durationMonths: 1,
  isActive: true,
  sortOrder: 0,
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(emptyPlan)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans')
      const data = await res.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan),
      })

      if (res.ok) {
        fetchPlans()
        setShowModal(false)
        setEditingPlan(emptyPlan)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このプランを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPlans()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openCreateModal = () => {
    setEditingPlan(emptyPlan)
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      sessionsPerMonth: plan.sessionsPerMonth,
      durationMonths: plan.durationMonths,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    })
    setIsEditing(true)
    setShowModal(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-900" style={{ fontFamily: 'var(--font-bebas)' }}>
              PLANS
            </h1>
            <p className="text-dark-500">プラン管理</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            新規プラン
          </Button>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hoverable>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-400/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary-500" />
                    </div>
                    <Badge variant={plan.isActive ? 'success' : 'danger'}>
                      {plan.isActive ? '公開中' : '非公開'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-dark-900">{formatCurrency(plan.price)}</span>
                    <span className="text-dark-500">/月</span>
                  </div>
                  <p className="text-primary-500 font-medium mb-3">
                    月{plan.sessionsPerMonth === 0 ? '無制限' : `${plan.sessionsPerMonth}回`}
                  </p>
                  {plan.description && (
                    <p className="text-dark-600 text-sm mb-4">{plan.description}</p>
                  )}
                  <div className="text-sm text-dark-500 mb-4">
                    利用中: {plan._count?.members || 0}名
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(plan)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      編集
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CreditCard className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500">プランが見つかりません</p>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'プランを編集' : '新規プラン'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="プラン名"
            value={editingPlan.name}
            onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
            required
          />
          <div>
            <label className="input-label">説明</label>
            <textarea
              className="input min-h-[100px]"
              value={editingPlan.description}
              onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="月額料金（円）"
              type="number"
              value={editingPlan.price}
              onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="月のセッション数（0=無制限）"
              type="number"
              value={editingPlan.sessionsPerMonth}
              onChange={(e) => setEditingPlan({ ...editingPlan, sessionsPerMonth: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="表示順"
              type="number"
              value={editingPlan.sortOrder}
              onChange={(e) => setEditingPlan({ ...editingPlan, sortOrder: parseInt(e.target.value) || 0 })}
            />
            <div>
              <label className="input-label">ステータス</label>
              <select
                className="input"
                value={editingPlan.isActive ? 'true' : 'false'}
                onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.value === 'true' })}
              >
                <option value="true">公開</option>
                <option value="false">非公開</option>
              </select>
            </div>
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
