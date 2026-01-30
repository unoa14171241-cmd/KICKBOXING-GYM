'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              利用規約
            </h1>
            <p className="text-gray-600">
              最終更新日: 2024年1月1日
            </p>
          </div>

          <Card>
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第1条（目的）</h2>
              <p className="text-gray-600 mb-6">
                本規約は、KICKBOXING TRIM GYM（以下「当ジム」）が提供するサービスの利用条件を定めるものです。
                会員の皆様は、本規約に同意の上、当ジムのサービスをご利用ください。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第2条（会員資格）</h2>
              <p className="text-gray-600 mb-4">
                当ジムの会員となるには、以下の条件を満たす必要があります。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>16歳以上であること（18歳未満の方は保護者の同意が必要）</li>
                <li>医師から運動を禁止されていないこと</li>
                <li>反社会的勢力に属していないこと</li>
                <li>本規約に同意すること</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第3条（入会手続き）</h2>
              <p className="text-gray-600 mb-6">
                入会を希望される方は、所定の入会申込書に必要事項を記入し、入会金および初月会費をお支払いいただくことで、
                会員資格を取得することができます。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第4条（会費）</h2>
              <p className="text-gray-600 mb-4">
                会員は、所定の月会費を毎月お支払いいただきます。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>会費は毎月27日に翌月分を口座振替またはクレジットカード決済にてお支払いいただきます</li>
                <li>退会または休会の届出がない限り、会費は自動的に継続されます</li>
                <li>一度お支払いいただいた会費は、理由の如何を問わず返金いたしません</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第5条（予約・キャンセル）</h2>
              <p className="text-gray-600 mb-4">
                トレーニングの予約およびキャンセルについて、以下のルールを設けています。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>予約は、オンラインシステムまたは電話にて承ります</li>
                <li>キャンセルはレッスン開始24時間前まで可能です</li>
                <li>24時間を切ってからのキャンセルは、1回分のレッスン消化となります</li>
                <li>無断欠席の場合も、1回分のレッスン消化となります</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第6条（禁止事項）</h2>
              <p className="text-gray-600 mb-4">
                会員は、以下の行為を行ってはなりません。
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>他の会員やスタッフへの迷惑行為、暴力行為</li>
                <li>施設や備品の破損、汚損</li>
                <li>許可なく施設内で営業活動、勧誘活動を行うこと</li>
                <li>飲酒後または薬物使用後のトレーニング</li>
                <li>その他、当ジムが不適切と判断する行為</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第7条（退会）</h2>
              <p className="text-gray-600 mb-6">
                退会を希望される場合は、退会希望月の前月15日までに所定の退会届をご提出ください。
                届出のない場合、会費は継続して発生します。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第8条（休会）</h2>
              <p className="text-gray-600 mb-6">
                休会を希望される場合は、休会希望月の前月15日までにお申し出ください。
                休会中は月額2,200円（税込）の休会費が発生します。休会期間は最長3ヶ月までとなります。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第9条（免責事項）</h2>
              <p className="text-gray-600 mb-6">
                当ジムは、会員がトレーニング中に被った傷害、疾病、盗難等について、
                当ジムの故意または重大な過失による場合を除き、責任を負いません。
                会員は、自己の責任においてトレーニングを行うものとします。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第10条（規約の変更）</h2>
              <p className="text-gray-600 mb-6">
                当ジムは、必要に応じて本規約を変更することがあります。
                変更後の規約は、当ジムのウェブサイトに掲載した時点で効力を生じるものとします。
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">第11条（準拠法・管轄裁判所）</h2>
              <p className="text-gray-600">
                本規約は日本法に準拠するものとし、本規約に関する一切の紛争については、
                水戸地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
