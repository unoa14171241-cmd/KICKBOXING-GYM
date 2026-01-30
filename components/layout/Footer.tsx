import Link from 'next/link'
import { Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-bebas)' }}>B</span>
              </div>
              <span className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
                BLAZE KICKBOXING
              </span>
            </div>
            <p className="text-dark-400 text-sm">
              最高のキックボクシング体験を。<br />
              プロのトレーナーがあなたの目標達成をサポートします。
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
                <Instagram className="w-5 h-5 text-dark-300" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
                <Twitter className="w-5 h-5 text-dark-300" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
                <Youtube className="w-5 h-5 text-dark-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">クイックリンク</h4>
            <ul className="space-y-2">
              <li><Link href="/plans" className="text-dark-400 hover:text-white transition-colors">料金プラン</Link></li>
              <li><Link href="/trainers" className="text-dark-400 hover:text-white transition-colors">トレーナー紹介</Link></li>
              <li><Link href="/events" className="text-dark-400 hover:text-white transition-colors">イベント</Link></li>
              <li><Link href="/shop" className="text-dark-400 hover:text-white transition-colors">ショップ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">サポート</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-dark-400 hover:text-white transition-colors">よくある質問</Link></li>
              <li><Link href="/terms" className="text-dark-400 hover:text-white transition-colors">利用規約</Link></li>
              <li><Link href="/privacy" className="text-dark-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/contact" className="text-dark-400 hover:text-white transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">アクセス</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-dark-400">
                <MapPin className="w-5 h-5 mt-0.5 text-primary-500" />
                <span>〒150-0001<br />東京都渋谷区神宮前1-1-1</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400">
                <Phone className="w-5 h-5 text-primary-500" />
                <span>03-1234-5678</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400">
                <Mail className="w-5 h-5 text-primary-500" />
                <span>info@blaze-gym.jp</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-800 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} BLAZE KICKBOXING GYM. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
