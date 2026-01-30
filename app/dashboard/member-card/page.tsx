'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, User, CreditCard, Smartphone } from 'lucide-react'

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
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
            DIGITAL MEMBER CARD
          </h1>
          <p className="text-dark-400">デジタル会員証</p>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-orange rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-bebas)' }}>B</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
                      BLAZE
                    </span>
                    <p className="text-xs text-dark-400">KICKBOXING GYM</p>
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
                <h2 className="text-2xl font-bold text-white">
                  {member.lastName} {member.firstName}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-500" />
                  <span className="font-mono text-lg text-dark-300 tracking-wider">
                    {member.memberNumber}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dark-700">
                <div className="text-center">
                  <p className="text-sm text-dark-400 mb-1">プラン</p>
                  <p className="text-white font-medium">{member.plan?.name || '未設定'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-dark-400 mb-1">入会日</p>
                  <p className="text-white font-medium">
                    {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary-500" />
              使い方
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-500 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">入館時</h4>
                  <p className="text-dark-400 text-sm">
                    受付のQRスキャナーに会員証を読み取らせてチェックインしてください。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-500 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">退館時</h4>
                  <p className="text-dark-400 text-sm">
                    同じように会員証をスキャンしてチェックアウトしてください。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-500 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">物販購入時</h4>
                  <p className="text-dark-400 text-sm">
                    ショップでの購入時に会員証を提示すると、会員価格が適用されます。
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
