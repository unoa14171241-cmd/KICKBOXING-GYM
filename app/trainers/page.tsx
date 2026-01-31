'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui'
import { User, Award, Star, Loader2 } from 'lucide-react'

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string | null
  bio: string | null
  isActive: boolean
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/trainers')
        if (!res.ok) throw new Error('トレーナー情報の取得に失敗しました')
        const data = await res.json()
        setTrainers(data.filter((t: Trainer) => t.isActive))
      } catch (err) {
        setError('トレーナー情報を取得できませんでした')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainers()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            OUR TRAINERS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            経験豊富なトレーナーがあなたをサポートします
          </motion.p>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">現在トレーナー情報はありません</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hoverable className="h-full">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {trainer.lastName} {trainer.firstName}
                      </h3>
                      {trainer.specialization && (
                        <p className="text-primary-500 font-medium mt-1">
                          {trainer.specialization}
                        </p>
                      )}
                    </div>

                    {trainer.bio && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {trainer.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              まずは体験から始めませんか？
            </h2>
            <p className="text-white/90 mb-8">
              経験豊富なトレーナーが丁寧に指導します
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
