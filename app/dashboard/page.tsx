'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, Badge, Button } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { QRCodeSVG } from 'qrcode.react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  Calendar, Clock, User, CreditCard, QrCode, 
  TrendingUp, ArrowRight, CheckCircle2
} from 'lucide-react'

interface Member {
  id: string
  firstName: string
  lastName: string
  memberNumber: string
  qrCode: string
  status: string
  remainingSessions: number
  plan: {
    name: string
    sessionsPerMonth: number
    price: number
  } | null
  reservations: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    trainer: {
      firstName: string
      lastName: string
    }
  }>
  checkIns: Array<{
    id: string
    checkedInAt: string
    checkedOutAt: string | null
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => {
          setMember(data.member)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [session])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-dark-400">会員情報を取得できませんでした</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              WELCOME, {member.lastName} {member.firstName}
            </h1>
            <p className="text-dark-400">会員番号: {member.memberNumber}</p>
          </div>
          <Link href="/dashboard/reserve">
            <Button>
              <Calendar className="w-5 h-5 mr-2" />
              予約する
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <CreditCard className="w-5 h-5 text-primary-500" />
                  </div>
                  <span className="text-dark-400 text-sm">現在のプラン</span>
                </div>
                <p className="text-2xl font-bold text-white">{member.plan?.name || '未設定'}</p>
                {member.plan && (
                  <p className="text-dark-400 text-sm">{formatCurrency(member.plan.price)}/月</p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-orange/20">
                    <TrendingUp className="w-5 h-5 text-accent-orange" />
                  </div>
                  <span className="text-dark-400 text-sm">残りセッション</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {member.plan?.sessionsPerMonth === 0 ? '無制限' : `${member.remainingSessions}回`}
                </p>
                {member.plan && member.plan.sessionsPerMonth > 0 && (
                  <p className="text-dark-400 text-sm">月{member.plan.sessionsPerMonth}回まで</p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-dark-400 text-sm">ステータス</span>
                </div>
                <Badge status={member.status} className="text-lg py-1.5 px-4" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-dark-400 text-sm">予約件数</span>
                </div>
                <p className="text-2xl font-bold text-white">{member.reservations.length}件</p>
                <p className="text-dark-400 text-sm">今後の予約</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glow" className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-white">デジタル会員証</h2>
              </div>
              <div className="qr-container mx-auto mb-4">
                <QRCodeSVG
                  value={member.qrCode}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-dark-400 mb-2">会員番号</p>
              <p className="text-lg font-mono font-semibold text-white tracking-wider">
                {member.memberNumber}
              </p>
              <p className="text-xs text-dark-500 mt-4">
                入退館時にこのQRコードをスキャンしてください
              </p>
            </Card>
          </motion.div>

          {/* Upcoming Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  今後の予約
                </h2>
                <Link href="/dashboard/reservations" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                  すべて見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {member.reservations.length > 0 ? (
                <div className="space-y-4">
                  {member.reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {formatDate(reservation.date)}
                          </p>
                          <p className="text-sm text-dark-400">
                            {reservation.startTime} - {reservation.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          {reservation.trainer.lastName} トレーナー
                        </p>
                        <Badge status="confirmed" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 mb-4">予約がありません</p>
                  <Link href="/dashboard/reserve">
                    <Button size="sm">予約を作成する</Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Recent Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                最近の入退館履歴
              </h2>
            </div>

            {member.checkIns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>チェックイン</th>
                      <th>チェックアウト</th>
                      <th>滞在時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.checkIns.map((checkIn) => {
                      const inTime = new Date(checkIn.checkedInAt)
                      const outTime = checkIn.checkedOutAt ? new Date(checkIn.checkedOutAt) : null
                      const duration = outTime
                        ? Math.round((outTime.getTime() - inTime.getTime()) / 1000 / 60)
                        : null

                      return (
                        <tr key={checkIn.id}>
                          <td>
                            {inTime.toLocaleDateString('ja-JP')} {inTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            {outTime
                              ? `${outTime.toLocaleDateString('ja-JP')} ${outTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
                              : <Badge variant="warning">滞在中</Badge>
                            }
                          </td>
                          <td>
                            {duration !== null ? `${duration}分` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">まだ入退館履歴がありません</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
