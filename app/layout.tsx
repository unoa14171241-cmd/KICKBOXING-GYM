import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'BLAZE KICKBOXING GYM | キックボクシングパーソナルジム',
  description: '最高のキックボクシング体験を。パーソナルトレーニングで理想の身体を手に入れよう。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
