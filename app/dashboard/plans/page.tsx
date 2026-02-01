'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, Button, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CreditCard, Check, Zap, Clock, Users, Star, ArrowRight, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  sessionsPerMonth: number
  durationMonths: number
  category: string
  features: string[]
  duration?: number
  type?: string
  sortOrder: number
}

interface Member {
  id: string
  planId: string | null
  plan: {
    id: string
    name: string
    price: number
  } | null
  remainingSessions: number
}

export default function PlansPage() {
  const { data: session } = useSession()
  const [membershipPlans, setMembershipPlans] = useState<Plan[]>([])
  const [personalPlans, setPersonalPlans] = useState<Plan[]>([])
  const [ticketPlans, setTicketPlans] = useState<Plan[]>([])
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'membership' | 'personal' | 'ticket'>('membership')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 会員情報を取得
        const memberRes = await fetch('/api/members/me')
        if (memberRes.ok) {
          const memberData = await memberRes.json()
          setMember(memberData)
        }

        // プラン一覧を取得
        const [membershipRes, personalRes, ticketRes] = await Promise.all([
          fetch('/api/plans?category=membership'),
          fetch('/api/plans?category=personal'),
          fetch('/api/plans?category=ticket'),
        ])

        if (membershipRes.ok) {
          const data = await membershipRes.json()
          setMembershipPlans(data)
        }
        if (personalRes.ok) {
          const data = await personalRes.json()
          setPersonalPlans(data)
        }
        if (ticketRes.ok) {
          const data = await ticketRes.json()
          setTicketPlans(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePurchase = async () => {
    if (!selectedPlan) return

    setIsPurchasing(true)
    try {
      const res = await fetch('/api/members/me/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id }),
      })

      if (res.ok) {
        const updatedMember = await res.json()
        setMember(updatedMember)
        setShowConfirm(false)
        setSelectedPlan(null)
        alert('プランの購入が完了しました！')
      } else {
        const data = await res.json()
        alert(data.error || 'プランの購入に失敗しました')
      }
    } catch (error) {
      alert('エラーが発生しました')
    } finally {
      setIsPurchasing(false)
    }
  }

  const getCurrentPlans = () => {
    switch (activeTab) {
      case 'membership':
        return membershipPlans
      case 'personal':
        return personalPlans
      case 'ticket':
        return ticketPlans
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">プラン</h1>
          <p className="text-gray-500">プランの確認・購入・追加ができます</p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" />
            現在のプラン
          </h2>
          
          {member?.plan ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary-50 border border-primary-200">
              <div>
                <p className="font-semibold text-gray-900">{member.plan.name}</p>
                <p className="text-sm text-gray-500">
                  月額 ¥{member.plan.price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="success">契約中</Badge>
                {member.remainingSessions > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    残りセッション: {member.remainingSessions}回
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <p className="text-gray-500">現在契約中のプランはありません</p>
              <p className="text-sm text-gray-400 mt-1">下記からプランを選択してください</p>
            </div>
          )}
        </Card>

        {/* Plan Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'membership', label: '月額会員', icon: Users },
            { id: 'personal', label: 'パーソナル', icon: Star },
            { id: 'ticket', label: '回数券', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentPlans().map((plan, index) => {
            const isCurrentPlan = member?.plan?.id === plan.id
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`h-full relative ${isCurrentPlan ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-4">
                      <Badge variant="primary">現在のプラン</Badge>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {activeTab === 'membership' ? '/月' : ''}
                    </span>
                  </div>

                  {plan.sessionsPerMonth > 0 && (
                    <p className="text-sm text-primary-600 mb-4">
                      月{plan.sessionsPerMonth}回
                    </p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <Button variant="secondary" className="w-full" disabled>
                        契約中
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setShowConfirm(true)
                        }}
                      >
                        {activeTab === 'ticket' ? '購入する' : 'このプランに変更'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}

          {getCurrentPlans().length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>このカテゴリのプランはまだ登録されていません</p>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                プランの購入確認
              </h3>
              
              <div className="p-4 rounded-xl bg-gray-50 mb-6">
                <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  ¥{selectedPlan.price.toLocaleString()}
                </p>
                {selectedPlan.sessionsPerMonth > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    月{selectedPlan.sessionsPerMonth}回のセッション付き
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-6">
                ※ 購入後、管理者による承認が必要な場合があります。<br />
                ※ お支払いは店頭にてお願いいたします。
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirm(false)
                    setSelectedPlan(null)
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handlePurchase}
                  isLoading={isPurchasing}
                >
                  購入を申請
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
