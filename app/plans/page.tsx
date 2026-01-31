'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button, Card } from '@/components/ui'
import { 
  Check, ArrowRight, Sparkles, Calendar, 
  Shirt, Droplets, Hand, CreditCard, Shield,
  Clock, Users, Baby
} from 'lucide-react'

const membershipPlans = [
  { category: '一般フルタイム', price: '11,000', note: '' },
  { category: '学生フルタイム（中学生以上）', price: '8,800', note: '※学生証必要' },
  { category: '月4回', price: '8,800', note: '' },
  { category: '平日午前会員', price: '6,500', note: '' },
  { category: 'キッズ（小学生以下）', price: '6,500', note: '' },
  { category: 'ビジター', price: '3,500', note: '※1回' },
]

const bulkPlans = [
  { category: '半年一括（現金のみ）', originalPrice: '66,000', price: '60,000' },
  { category: '年間一括（現金のみ）', originalPrice: '132,000', price: '121,000' },
]

const dailyRates = [
  { period: '1日〜5日', rate: '100%' },
  { period: '6日〜10日', rate: '80%' },
  { period: '11日〜15日', rate: '65%' },
  { period: '16日〜20日', rate: '50%' },
  { period: '21日〜25日', rate: '35%' },
  { period: '26日〜末日', rate: '0%' },
]

const trialItems = [
  { icon: Shirt, text: '運動できる格好' },
  { icon: Hand, text: 'タオル' },
  { icon: Droplets, text: 'お飲み物' },
  { icon: Hand, text: '軍手（レンタルグローブ利用時必須）', note: '※お持ちでない場合は受付にて100円でご購入いただけます' },
]

const joinItems = [
  { icon: Sparkles, text: '入会金', note: '→体験時入会で半額' },
  { icon: Calendar, text: '当月分日割り＋翌月分会費' },
  { icon: Shield, text: 'スポーツ保険　年間2,000円（任意）' },
  { icon: CreditCard, text: '口座情報、クレジットカード情報がわかる物', note: '→お支払いいただいた分以降は引き落としとなります' },
]

export default function PlansPage() {
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
            料金案内
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            あなたに最適なプランをお選びください
          </motion.p>
        </div>
      </section>

      {/* 入会金セクション */}
      <section className="py-12 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">入会金</h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-5xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-bebas)' }}>
                ¥15,000
              </span>
              <ArrowRight className="w-8 h-8 text-primary-500" />
              <div className="bg-primary-500 text-white px-6 py-3 rounded-full">
                <span className="text-lg font-bold">体験当日の入会で入会金半額！</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 月会費テーブル */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 text-center mb-8"
          >
            月会費
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-primary-500 text-white">
                  <th className="py-4 px-6 text-left font-semibold">会員区分</th>
                  <th className="py-4 px-6 text-right font-semibold">月額</th>
                </tr>
              </thead>
              <tbody>
                {membershipPlans.map((plan, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-medium">{plan.category}</span>
                      {plan.note && <span className="text-sm text-gray-500 ml-2">{plan.note}</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-2xl font-bold text-gray-900">¥{plan.price}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* 一括払いプラン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border-2 border-primary-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              お得な一括払いプラン
            </h3>
            <div className="space-y-4">
              {bulkPlans.map((plan, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                  <span className="text-gray-900 font-medium">{plan.category}</span>
                  <div className="text-right">
                    <span className="text-gray-400 line-through text-lg mr-3">¥{plan.originalPrice}</span>
                    <span className="text-2xl font-bold text-primary-600">¥{plan.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-center text-gray-500 mt-4">※税込での価格となります。</p>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-gray-700">
              <Users className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <p>親子クラスはお子様のみの参加は不可となります。</p>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <p>祝日は日曜スケジュールへの変更となりますのでご確認の上ご来店下さい。</p>
            </div>
          </div>
        </div>
      </section>

      {/* クラス参加について */}
      <section className="py-12 bg-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">各クラス途中参加、途中退出OK！</h3>
            <p className="text-lg text-white/90">休憩等も自由にとって頂いて構いません。</p>
          </motion.div>
        </div>
      </section>

      {/* 日割り計算 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 text-center mb-2"
          >
            日割り計算について
          </motion.h2>
          <p className="text-center text-gray-600 mb-8">ご入会日により5日ごとの日割り計算になります</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-6 text-left font-semibold text-gray-700">入会日</th>
                  <th className="py-3 px-6 text-right font-semibold text-gray-700">日割り料金</th>
                </tr>
              </thead>
              <tbody>
                {dailyRates.map((rate, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-6 text-gray-900">{rate.period}</td>
                    <td className="py-3 px-6 text-right">
                      <span className={`font-bold ${rate.rate === '0%' ? 'text-green-600' : 'text-gray-900'}`}>
                        {rate.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* 持ち物セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 体験時の持ち物 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-500">
                  体験時にご持参いただくもの
                </h3>
                <ul className="space-y-4">
                  {trialItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <span className="text-gray-900">{item.text}</span>
                        {item.note && (
                          <p className="text-sm text-gray-500 mt-1">{item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* 入会時の必要物 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-500">
                  入会時に必要な物
                </h3>
                <ul className="space-y-4">
                  {joinItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <span className="text-gray-900">{item.text}</span>
                        {item.note && (
                          <p className="text-sm text-primary-600 mt-1">{item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                  <p>※初回キャッシュレス決済可能です。</p>
                  <p>※学生の方は学生証の原本とコピーの持参をお願い致します。</p>
                </div>
              </Card>
            </motion.div>
          </div>
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
              まずは無料体験から！
            </h2>
            <p className="text-white/90 mb-8">
              体験当日の入会で入会金半額キャンペーン実施中
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 shadow-xl border-4 border-white font-bold text-lg px-10 py-4">
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
