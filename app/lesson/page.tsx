'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button, Card } from '@/components/ui'
import { 
  Clock, ArrowRight, Users, Baby, Calendar,
  Star, MessageCircle, Sparkles
} from 'lucide-react'

const course30min = {
  title: '30分コース',
  trial: { original: '4,500', discounted: '2,500' },
  monthly: [
    { name: '月4回', price: '16,000', perSession: '4,000' },
    { name: '月6回', price: '21,000', perSession: '3,500' },
  ],
  tickets: [
    { count: '3回券', price: '13,500', perSession: '4,500', validity: '3ヶ月' },
    { count: '5回券', price: '21,000', perSession: '4,200', validity: '6ヶ月' },
    { count: '10回券', price: '40,000', perSession: '4,000', validity: '12ヶ月' },
  ],
}

const course60min = {
  title: '60分コース',
  trial: { original: '6,000', discounted: '3,500' },
  monthly: [
    { name: '月4回', price: '22,000', perSession: '5,500' },
    { name: '月6回', price: '30,000', perSession: '5,000' },
  ],
  tickets: [
    { count: '3回券', price: '18,000', perSession: '6,000', validity: '3ヶ月' },
    { count: '5回券', price: '28,500', perSession: '5,700', validity: '6ヶ月' },
    { count: '10回券', price: '54,000', perSession: '5,400', validity: '12ヶ月' },
  ],
}

const notes = [
  { icon: Star, text: '各コースでトレーナーの指名が可能です。（指名料はトレーナーにより異なります）' },
  { icon: Clock, text: '体験レッスンはカウンセリング後開始となりますので、ご希望のコース時間＋30分のお時間をいただきます。' },
  { icon: Users, text: 'ペアでのご希望の場合、表示価格より各1,000円引きとなります。' },
  { icon: Baby, text: '小学生以下は半額となります。' },
  { icon: MessageCircle, text: 'ペアや複数人でのレッスンも可能ですのでお問い合わせください。' },
]

function CourseSection({ course, delay = 0 }: { course: typeof course30min; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-primary-500 text-white px-6 py-4 -mx-6 -mt-6 mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            {course.title}
          </h3>
        </div>

        {/* 体験レッスン */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            体験レッスン
          </h4>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 flex items-center justify-center gap-4">
            <span className="text-gray-400 line-through text-xl">¥{course.trial.original}</span>
            <ArrowRight className="w-5 h-5 text-primary-500" />
            <span className="text-3xl font-bold text-primary-600">¥{course.trial.discounted}</span>
          </div>
        </div>

        {/* 月額プラン */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">◆ コース料金</h4>
          <div className="space-y-3">
            {course.monthly.map((plan, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <span className="font-medium text-gray-900">{plan.name}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">¥{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-2">（1回あたり¥{plan.perSession}）</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 回数券 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">◆ 回数券</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 rounded-tl-lg">回数券</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">料金</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700 rounded-tr-lg">有効期限</th>
                </tr>
              </thead>
              <tbody>
                {course.tickets.map((ticket, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-gray-900 font-medium">{ticket.count}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">¥{ticket.price}</span>
                      <span className="text-sm text-gray-500 block">（1回あたり¥{ticket.perSession}）</span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ticket.validity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function LessonPage() {
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
            パーソナルレッスン
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            完全マンツーマンで目標達成をサポート
          </motion.p>
        </div>
      </section>

      {/* 特徴 */}
      <section className="py-12 bg-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">完全パーソナルトレーニング</h2>
            <p className="text-white/90">
              パーソナルの受付可能時間帯はジムは閉館している為、<br className="hidden md:block" />
              他のお客様は全くいない状態の完全パーソナルトレーニングとなります。
            </p>
          </motion.div>
        </div>
      </section>

      {/* コース料金 */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <CourseSection course={course30min} delay={0} />
            <CourseSection course={course60min} delay={0.1} />
          </div>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 text-center mb-8"
          >
            ご利用にあたって
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <ul className="space-y-4">
                {notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <note.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-gray-700 pt-1">{note.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
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
              体験レッスンはこちら
            </h2>
            <p className="text-white/90 mb-8">
              まずはお気軽にお問い合わせください
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 shadow-xl border-4 border-white font-bold text-lg px-10 py-4">
                体験レッスンを予約する
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
