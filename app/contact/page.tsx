'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, Button, Input } from '@/components/ui'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // シミュレーション（実際はAPIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              お問い合わせ
            </h1>
            <p className="text-gray-600">
              ご質問・ご相談はお気軽にどうぞ
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">電話</h3>
                    <p className="text-gray-600">029-XXX-XXXX</p>
                    <p className="text-sm text-gray-500">受付時間: 10:00〜21:00</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">メール</h3>
                    <p className="text-gray-600">info@trim-gym.com</p>
                    <p className="text-sm text-gray-500">24時間受付</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">住所</h3>
                    <p className="text-gray-600">
                      〒305-0000<br />
                      茨城県つくば市○○ 1-2-3
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">営業時間</h3>
                    <p className="text-gray-600">
                      平日: 10:00〜22:00<br />
                      土日祝: 10:00〜20:00
                    </p>
                    <p className="text-sm text-gray-500">定休日: 毎週水曜日</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      送信完了
                    </h3>
                    <p className="text-gray-600 mb-6">
                      お問い合わせありがとうございます。<br />
                      2営業日以内にご返信いたします。
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      新しいお問い合わせ
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        label="お名前 *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="山田 太郎"
                        required
                      />
                      <Input
                        label="メールアドレス *"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        label="電話番号"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="090-1234-5678"
                      />
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          お問い合わせ種別 *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                          required
                        >
                          <option value="">選択してください</option>
                          <option value="trial">無料体験のお申し込み</option>
                          <option value="membership">入会について</option>
                          <option value="schedule">営業時間・スケジュール</option>
                          <option value="price">料金について</option>
                          <option value="other">その他</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お問い合わせ内容 *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 resize-none"
                        placeholder="お問い合わせ内容をご記入ください"
                        required
                      />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                      <p>
                        ※ 送信いただいた個人情報は、お問い合わせへの回答にのみ使用し、
                        <a href="/privacy" className="text-primary-500 hover:underline">プライバシーポリシー</a>
                        に従って適切に管理いたします。
                      </p>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                      <Send className="w-5 h-5 mr-2" />
                      送信する
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
