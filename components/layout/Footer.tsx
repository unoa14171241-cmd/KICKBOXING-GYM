import Link from 'next/link'
import { Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-bebas)' }}>KICK</span>
              </div>
              <span className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
                TRIM GYM
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              茨城県のキックボクシングジム。<br />
              プロのトレーナーがあなたの目標達成をサポートします。
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-primary-500 transition-colors">
                <Instagram className="w-5 h-5 text-gray-300" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-primary-500 transition-colors">
                <Twitter className="w-5 h-5 text-gray-300" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-primary-500 transition-colors">
                <Youtube className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">クイックリンク</h4>
            <ul className="space-y-2">
              <li><Link href="/plans" className="text-gray-400 hover:text-primary-400 transition-colors">料金案内</Link></li>
              <li><Link href="/trainers" className="text-gray-400 hover:text-primary-400 transition-colors">パーソナルレッスン</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-primary-400 transition-colors">イベント</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-primary-400 transition-colors">ショップ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">サポート</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-primary-400 transition-colors">よくある質問</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors">利用規約</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">アクセス</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 text-primary-500" />
                <span>〒305-0000<br />茨城県つくば市○○ 1-2-3</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-primary-500" />
                <span>029-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-primary-500" />
                <span>info@trim-gym.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} KICKBOXING TRIM GYM. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
