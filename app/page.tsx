'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button, Card } from '@/components/ui'
import { 
  Flame, Target, Users, Trophy, Calendar, 
  ShoppingBag, QrCode, Shield, ArrowRight,
  Zap, Heart, Clock
} from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'パーソナルトレーニング',
    description: '一人ひとりの目標に合わせた完全オーダーメイドのトレーニングプログラム',
  },
  {
    icon: Users,
    title: 'プロトレーナー',
    description: '現役・元プロ選手による本格的な指導で確実にスキルアップ',
  },
  {
    icon: Clock,
    title: '柔軟な予約システム',
    description: 'オンラインで24時間いつでも予約・振替が可能',
  },
  {
    icon: Shield,
    title: '初心者歓迎',
    description: '未経験者でも安心。基礎から丁寧に指導します',
  },
]

const stats = [
  { value: '500+', label: '会員数' },
  { value: '10+', label: 'トレーナー' },
  { value: '98%', label: '満足度' },
  { value: '5年+', label: '運営実績' },
]

const plans = [
  {
    name: 'ライト',
    price: '19,800',
    sessions: '月4回',
    features: ['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約'],
    popular: false,
  },
  {
    name: 'スタンダード',
    price: '34,800',
    sessions: '月8回',
    features: ['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約', 'グローブ貸出無料', 'イベント優先参加'],
    popular: true,
  },
  {
    name: 'プレミアム',
    price: '49,800',
    sessions: '無制限',
    features: ['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約', 'グローブ貸出無料', 'イベント優先参加', '栄養指導', 'プロテイン提供'],
    popular: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pattern-grid">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-orange/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-medium mb-6">
                <Flame className="w-4 h-4" />
                最高のキックボクシング体験を
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
            >
              IGNITE YOUR
              <span className="block bg-gradient-to-r from-primary-500 via-accent-orange to-accent-gold bg-clip-text text-transparent">
                FIGHTING SPIRIT
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-dark-300 max-w-2xl mx-auto mb-10"
            >
              プロのトレーナーによる完全マンツーマン指導。<br />
              初心者からプロ志望まで、あなたの目標達成をサポートします。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button size="lg" className="group">
                  無料体験を予約する
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="secondary" size="lg">
                  料金プランを見る
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                  {stat.value}
                </div>
                <div className="text-dark-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-dark-500 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary-500"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              WHY CHOOSE BLAZE?
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              BLAZEが選ばれる理由
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-orange/20 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24 relative pattern-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              MEMBERSHIP PLANS
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              あなたに最適なプランをお選びください
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                        <Zap className="w-4 h-4 text-accent-gold" />
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
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-orange/20 to-accent-gold/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
              START YOUR JOURNEY TODAY
            </h2>
            <p className="text-xl text-dark-300 mb-8">
              まずは無料体験から。あなたの変化がここから始まります。
            </p>
            <Link href="/register">
              <Button size="lg" className="fire-glow">
                無料体験を予約する
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
