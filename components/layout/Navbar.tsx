'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: '/plans', label: 'プラン' },
    { href: '/trainers', label: 'トレーナー' },
    { href: '/events', label: 'イベント' },
    { href: '/shop', label: 'ショップ' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-bebas)' }}>B</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
              BLAZE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-dark-300 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-4">
                <Link
                  href={session.user.role === 'member' ? '/dashboard' : '/admin'}
                  className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>ダッシュボード</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>ログアウト</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">ログイン</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">入会申込</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-dark-700"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-dark-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-dark-700 space-y-3">
                {session ? (
                  <>
                    <Link
                      href={session.user.role === 'member' ? '/dashboard' : '/admin'}
                      className="flex items-center gap-2 py-2 text-dark-300 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>ダッシュボード</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 py-2 text-dark-300 hover:text-white transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>ログアウト</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">ログイン</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" className="w-full">入会申込</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
