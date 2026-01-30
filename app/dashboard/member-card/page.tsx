'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, Badge, Button } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, User, CreditCard, Smartphone, ScanLine, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Member {
  firstName: string
  lastName: string
  memberNumber: string
  qrCode: string
  status: string
  plan: {
    name: string
  } | null
  joinedAt: string
}

export default function MemberCardPage() {
  const { data: session } = useSession()
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => setMember(data.member))
        .catch(console.error)
    }
  }, [session])

  if (!member) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
            DIGITAL MEMBER CARD
          </h1>
          <p className="text-dark-500">デジタル会員証</p>
        </div>

        {/* Member Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glow" className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500 to-accent-orange rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-accent-gold to-accent-orange rounded-full -ml-24 -mb-24" />
            </div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-bebas)' }}>K</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-dark-900" style={{ fontFamily: 'var(--font-bebas)' }}>
                      TRIM GYM
                    </span>
                    <p className="text-xs text-dark-500">KICKBOXING GYM</p>
                  </div>
                </div>
                <Badge status={member.status} />
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <div className="qr-container">
                  <QRCodeSVG
                    value={member.qrCode}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-dark-900">
                  {member.lastName} {member.firstName}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-500" />
                  <span className="font-mono text-lg text-dark-500 tracking-wider">
                    {member.memberNumber}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dark-200">
                <div className="text-center">
                  <p className="text-sm text-dark-500 mb-1">プラン</p>
                  <p className="text-dark-900 font-medium">{member.plan?.name || '未設定'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-dark-500 mb-1">入会日</p>
                  <p className="text-dark-900 font-medium">
                    {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Check-in Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <Card className="text-center bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ScanLine className="w-6 h-6 text-primary-500" />
              <h3 className="text-lg font-bold text-dark-900">セルフチェックイン</h3>
            </div>
            <p className="text-dark-600 mb-4">店舗のQRコードを読み取るか、下のボタンからチェックイン</p>
            <Link href="/checkin">
              <Button className="w-full">
                チェックイン / チェックアウト
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card>
            <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary-500" />
              チェックイン方法
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="text-dark-900 font-medium">店舗のQRコードを読み取る</h4>
                  <p className="text-dark-500 text-sm">
                    店舗入口にあるQRコードをスマホのカメラで読み取ってください。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="text-dark-900 font-medium">自動でチェックイン</h4>
                  <p className="text-dark-500 text-sm">
                    ログイン済みの場合、自動でチェックインが完了します。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="text-dark-900 font-medium">退館時も同じ操作</h4>
                  <p className="text-dark-500 text-sm">
                    帰りも同じようにQRコードを読み取ると、チェックアウトになります。
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
