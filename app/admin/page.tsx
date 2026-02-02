'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, Badge } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Users, Calendar, TrendingUp, DollarSign, 
  UserPlus, CheckCircle, Clock, ShoppingBag, Building2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  totalMembers: number
  activeMembers: number
  todayReservations: number
  todayCheckIns: number
  monthlyRevenue: number
  newMembersThisMonth: number
  totalStores: number
}

interface StoreInfo {
  id: string
  name: string
  code: string
  _count: {
    members: number
    trainers: number
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [stores, setStores] = useState<StoreInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data.stats)
      setStores(data.stores || [])
    } catch (error) {
      console.error(error)
      // デモ用のダミーデータ
      setStats({
        totalMembers: 156,
        activeMembers: 142,
        todayReservations: 24,
        todayCheckIns: 18,
        monthlyRevenue: 4520000,
        newMembersThisMonth: 12,
        totalStores: 2,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: '総会員数',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'アクティブ会員',
      value: stats?.activeMembers || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      title: '本日の予約',
      value: stats?.todayReservations || 0,
      icon: Calendar,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/20',
    },
    {
      title: '本日のチェックイン',
      value: stats?.todayCheckIns || 0,
      icon: Clock,
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange/20',
    },
    {
      title: '今月の売上',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: DollarSign,
      color: 'text-accent-gold',
      bgColor: 'bg-accent-gold/20',
      isText: true,
    },
    {
      title: '今月の新規会員',
      value: stats?.newMembersThisMonth || 0,
      icon: UserPlus,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: '店舗数',
      value: stats?.totalStores || 0,
      icon: Building2,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/20',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-dark-900" style={{ fontFamily: 'var(--font-bebas)' }}>
            DASHBOARD
          </h1>
          <p className="text-dark-400">管理ダッシュボード</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-dark-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden p-3 md:p-4">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-10 -mt-10 opacity-50`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">{stat.title}</p>
                      <p className="text-base md:text-2xl font-bold text-dark-900">
                        {stat.isText ? stat.value : stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">クイックアクション</h2>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <a
                href="/admin/members/new"
                className="p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700 transition-colors text-center"
              >
                <UserPlus className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <span className="text-sm text-dark-300">新規会員登録</span>
              </a>
              <a
                href="/admin/checkin"
                className="p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700 transition-colors text-center"
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <span className="text-sm text-dark-300">チェックイン</span>
              </a>
              <a
                href="/admin/reservations"
                className="p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700 transition-colors text-center"
              >
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <span className="text-sm text-dark-300">予約管理</span>
              </a>
              <a
                href="/admin/products"
                className="p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700 transition-colors text-center"
              >
                <ShoppingBag className="w-8 h-8 text-accent-orange mx-auto mb-2" />
                <span className="text-sm text-dark-300">商品管理</span>
              </a>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">本日の予約</h2>
            <div className="space-y-3">
              {/* デモデータ */}
              {[
                { time: '10:00', name: '田中 太郎', trainer: '山田トレーナー' },
                { time: '11:00', name: '鈴木 花子', trainer: '佐藤トレーナー' },
                { time: '14:00', name: '高橋 健', trainer: '山田トレーナー' },
              ].map((reservation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-dark-900 font-medium">{reservation.name}</p>
                      <p className="text-xs text-dark-400">{reservation.trainer}</p>
                    </div>
                  </div>
                  <span className="text-dark-300">{reservation.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 店舗情報 */}
        {stores.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-900">店舗一覧</h2>
              <button
                onClick={() => router.push('/admin/stores')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                すべて表示 →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/admin/stores/${store.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-teal-500/20">
                        <Building2 className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900">{store.name}</h3>
                        <p className="text-xs text-dark-400">コード: {store.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-dark-600">{store._count.members}名</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserPlus className="w-4 h-4 text-green-500" />
                        <span className="text-dark-600">{store._count.trainers}名</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
