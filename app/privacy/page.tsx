'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              プライバシーポリシー
            </h1>
            <p className="text-gray-600">
              最終更新日: 2024年1月1日
            </p>
          </div>

          <Card>
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. はじめに</h2>
              <p className="text-gray-600 mb-6">
                KICKBOXING TRIM GYM（以下「当ジム」）は、お客様の個人情報の保護を重要な責務と認識し、
                以下のプライバシーポリシーに従って個人情報を取り扱います。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">2. 収集する情報</h2>
              <p className="text-gray-600 mb-4">
                当ジムは、以下の個人情報を収集することがあります。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>氏名、住所、電話番号、メールアドレス等の連絡先情報</li>
                <li>生年月日、性別</li>
                <li>銀行口座情報、クレジットカード情報等の決済情報</li>
                <li>健康状態に関する情報</li>
                <li>トレーニング履歴、予約履歴</li>
                <li>当ジムのウェブサイト利用に関する情報（IPアドレス、Cookie等）</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">3. 情報の利用目的</h2>
              <p className="text-gray-600 mb-4">
                収集した個人情報は、以下の目的で利用します。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>サービスの提供および運営</li>
                <li>会費の請求および決済処理</li>
                <li>予約管理およびスケジュール調整</li>
                <li>お問い合わせへの対応</li>
                <li>新サービス、イベント、キャンペーン等のご案内</li>
                <li>サービスの改善および新サービスの開発</li>
                <li>統計データの作成（個人を特定できない形式）</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">4. 情報の第三者提供</h2>
              <p className="text-gray-600 mb-4">
                当ジムは、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>お客様の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>業務委託先に対して、業務遂行に必要な範囲で提供する場合</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">5. 情報の管理</h2>
              <p className="text-gray-600 mb-6">
                当ジムは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、
                漏洩等を防止するため、合理的な安全対策を講じます。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookieの使用</h2>
              <p className="text-gray-600 mb-6">
                当ジムのウェブサイトでは、サービス向上のためCookieを使用することがあります。
                Cookieの使用を希望されない場合は、ブラウザの設定で無効にすることができますが、
                一部の機能が利用できなくなる場合があります。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">7. 情報の開示・訂正・削除</h2>
              <p className="text-gray-600 mb-6">
                お客様は、当ジムに対して、ご自身の個人情報の開示、訂正、削除を請求することができます。
                請求をご希望の場合は、お問い合わせ窓口までご連絡ください。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">8. お子様の個人情報</h2>
              <p className="text-gray-600 mb-6">
                16歳未満のお子様の個人情報を収集する場合は、保護者の同意を得るものとします。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-600 mb-6">
                当ジムは、必要に応じて本プライバシーポリシーを変更することがあります。
                変更後のポリシーは、当ジムのウェブサイトに掲載した時点で効力を生じるものとします。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">10. お問い合わせ</h2>
              <p className="text-gray-600 mb-4">
                本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください。
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-600">
                <p className="font-semibold text-gray-900">KICKBOXING TRIM GYM</p>
                <p>〒305-0000 茨城県つくば市○○ 1-2-3</p>
                <p>TEL: 029-XXX-XXXX</p>
                <p>Email: info@trim-gym.com</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
