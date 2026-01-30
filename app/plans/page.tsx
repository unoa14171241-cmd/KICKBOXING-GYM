'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button, Card } from '@/components/ui'
import { Zap, Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'ライト',
    price: '19,800',
    sessions: '月4回',
    description: '週1回ペースでトレーニングしたい方向け',
    features: [
      'パーソナルトレーニング',
      '更衣室・シャワー利用',
      'オンライン予約',
    ],
    popular: false,
  },
  {
    name: 'スタンダード',
    price: '34,800',
    sessions: '月8回',
    description: '週2回ペースでしっかりトレーニングしたい方向け',
    features: [
      'パーソナルトレーニング',
      '更衣室・シャワー利用',
      'オンライン予約',
      'グローブ貸出無料',
      'イベント優先参加',
    ],
    popular: true,
  },
  {
    name: 'プレミアム',
    price: '49,800',
    sessions: '無制限',
    description: '本格的にトレーニングしたい方向け',
    features: [
      'パーソナルトレーニング',
      '更衣室・シャワー利用',
      'オンライン予約',
      'グローブ貸出無料',
      'イベント優先参加',
      '栄養指導',
      'プロテイン提供',
    ],
    popular: false,
  },
]

export default function PlansPage() {
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
            MEMBERSHIP PLANS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark-400"
          >
            あなたに最適なプランをお選びください
          </motion.p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  variant={plan.popular ? 'glow' : 'glass'} 
                  className={`h-full relative ${plan.popular ? 'scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-orange text-white text-sm font-semibold">
                        人気No.1
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-dark-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
                        ¥{plan.price}
                      </span>
                      <span className="text-dark-400">/月</span>
                    </div>
                    <p className="text-primary-400 mt-2">{plan.sessions}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-dark-300">
                        <Check className="w-5 h-5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button 
                      variant={plan.popular ? 'primary' : 'secondary'} 
                      className="w-full"
                    >
                      このプランで始める
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 pattern-dots">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12" style={{ fontFamily: 'var(--font-bebas)' }}>
            よくある質問
          </h2>
          <div className="space-y-6">
            {[
              { q: 'プランの変更はできますか？', a: 'はい、翌月からプランを変更することができます。ダッシュボードまたは受付にてお手続きください。' },
              { q: '休会は可能ですか？', a: 'はい、1ヶ月単位で休会が可能です。休会中は月額料金の50%をお支払いいただきます。' },
              { q: '予約のキャンセルはできますか？', a: '予約日の24時間前までキャンセル可能です。それ以降のキャンセルは1回分消化となります。' },
              { q: '振替は可能ですか？', a: 'はい、同月内で1回まで振替が可能です。' },
            ].map((faq, index) => (
              <Card key={index}>
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-dark-400">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
