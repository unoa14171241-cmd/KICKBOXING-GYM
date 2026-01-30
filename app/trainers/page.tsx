'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui'
import { User, Award, Star } from 'lucide-react'

const trainers = [
  {
    name: '山田 太郎',
    role: 'ヘッドトレーナー',
    specialization: 'キックボクシング・ボクシング',
    experience: '10年以上',
    bio: '元プロキックボクサー。全日本選手権優勝経験あり。10年以上の指導経験を持つベテラントレーナー。初心者から上級者まで幅広く対応します。',
    certifications: ['JKF公認トレーナー', 'NSCA-CPT'],
  },
  {
    name: '佐藤 花子',
    role: 'フィットネストレーナー',
    specialization: 'フィットネスキックボクシング',
    experience: '7年',
    bio: '女性専門トレーナー。ダイエットやボディメイクを得意としています。楽しみながら理想の体を手に入れるお手伝いをします。',
    certifications: ['NESTA-PFT', '栄養士'],
  },
  {
    name: '田中 健太',
    role: 'ムエタイトレーナー',
    specialization: 'ムエタイ・総合格闘技',
    experience: '8年',
    bio: 'ムエタイの本場タイで3年間の修行経験あり。本格的な技術を学びたい競技志向の方に最適です。',
    certifications: ['タイ国ムエタイ協会認定', 'JKF公認トレーナー'],
  },
]

export default function TrainersPage() {
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
            OUR TRAINERS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark-400"
          >
            経験豊富なプロフェッショナルがあなたをサポート
          </motion.p>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full">
                  {/* Avatar */}
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-orange/20 flex items-center justify-center">
                    <User className="w-16 h-16 text-primary-500" />
                  </div>

                  {/* Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                    <p className="text-primary-400">{trainer.role}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-accent-gold" />
                      <span className="text-dark-300">{trainer.specialization}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-accent-gold" />
                      <span className="text-dark-300">経験 {trainer.experience}</span>
                    </div>
                  </div>

                  <p className="text-dark-400 text-sm mt-4 mb-4">{trainer.bio}</p>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-2">
                    {trainer.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-dark-700 text-dark-300 text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
