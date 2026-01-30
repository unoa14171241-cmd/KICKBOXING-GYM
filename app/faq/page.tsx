'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: '入会について',
    questions: [
      {
        q: '体験レッスンはありますか？',
        a: 'はい、無料体験レッスンを随時受け付けております。お気軽にお問い合わせください。体験時には動きやすい服装とタオル、飲み物をご持参ください。',
      },
      {
        q: '入会に必要なものは何ですか？',
        a: '入会時には、身分証明書（運転免許証、保険証など）、銀行口座情報またはクレジットカード、印鑑が必要です。',
      },
      {
        q: '入会金はいくらですか？',
        a: '入会金は11,000円（税込）です。キャンペーン期間中は入会金無料となる場合もございます。',
      },
      {
        q: '未経験でも大丈夫ですか？',
        a: 'もちろん大丈夫です！当ジムの会員様の約80%が未経験からスタートされています。プロのトレーナーが基礎から丁寧に指導いたします。',
      },
    ],
  },
  {
    category: '料金・プランについて',
    questions: [
      {
        q: '月会費の支払い方法は？',
        a: '口座振替またはクレジットカード決済をお選びいただけます。毎月27日に翌月分の会費が引き落としとなります。',
      },
      {
        q: 'プランの変更はできますか？',
        a: 'はい、プラン変更は毎月15日までにお申し出いただければ、翌月から新プランが適用されます。',
      },
      {
        q: '休会制度はありますか？',
        a: 'はい、月額2,200円（税込）で休会が可能です。最長3ヶ月まで連続して休会できます。',
      },
    ],
  },
  {
    category: '予約・キャンセルについて',
    questions: [
      {
        q: '予約方法を教えてください',
        a: 'マイページからオンラインで24時間予約が可能です。また、お電話でも予約を承っております。',
      },
      {
        q: '予約のキャンセルはいつまでできますか？',
        a: 'レッスン開始の24時間前までキャンセル可能です。24時間を切ってからのキャンセルは1回分消化となりますのでご注意ください。',
      },
      {
        q: '振替レッスンはできますか？',
        a: 'はい、当月内であれば振替が可能です。マイページから振替予約をお取りください。',
      },
    ],
  },
  {
    category: '施設・設備について',
    questions: [
      {
        q: '更衣室やシャワーはありますか？',
        a: 'はい、男女別の更衣室とシャワールームを完備しております。タオルの貸し出しも行っております。',
      },
      {
        q: 'グローブは借りられますか？',
        a: 'スタンダードプラン以上の会員様は無料でレンタル可能です。ライトプランの方は330円（税込）でレンタルできます。',
      },
      {
        q: '駐車場はありますか？',
        a: '提携駐車場がございます。2時間まで無料でご利用いただけます。',
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-primary-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              よくある質問
            </h1>
            <p className="text-gray-600">
              お客様からよくいただくご質問をまとめました
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section, index) => (
              <Card key={index}>
                <h2 className="text-xl font-bold text-primary-600 mb-4 pb-4 border-b border-gray-100">
                  {section.category}
                </h2>
                <div>
                  {section.questions.map((item, qIndex) => (
                    <FAQItem key={qIndex} question={item.q} answer={item.a} />
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 text-center bg-primary-50 border-primary-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              お探しの回答が見つかりませんか？
            </h3>
            <p className="text-gray-600 mb-4">
              お気軽にお問い合わせください
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
            >
              お問い合わせ
            </a>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
