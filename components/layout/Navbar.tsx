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
    { href: '/plans', label: '料金案内' },
    { href: '/trainers', label: 'パーソナルレッスン' },
    { href: '/events', label: 'イベント' },
    { href: '/shop', label: 'ショップ' },
  ]

  return (
    <>
      {/* Top Banner - TRIM GYM風 */}
      <div className="bg-primary-500 text-white text-sm text-center py-2 fixed top-0 left-0 right-0 z-50">
        茨城県にあるキックボクシングジムです
      </div>
      
      <nav className="fixed top-8 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center border-2 border-primary-400">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-bebas)' }}>KICK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-primary-500 text-xs font-bold tracking-widest">KICKBOXING</span>
                <span className="text-white text-xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
                  TRIM GYM
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-4">
                  <Link
                    href={session.user.role === 'member' ? '/dashboard' : '/admin'}
                    className="flex items-center gap-2 text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>ダッシュボード</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>ログアウト</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-primary-400">ログイン</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">入会申込</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
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
              className="md:hidden bg-black/95 border-t border-gray-800"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-gray-300 hover:text-primary-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  {session ? (
                    <>
                      <Link
                        href={session.user.role === 'member' ? '/dashboard' : '/admin'}
                        className="flex items-center gap-2 py-2 text-gray-300 hover:text-primary-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>ダッシュボード</span>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 py-2 text-gray-300 hover:text-primary-400 transition-colors w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>ログアウト</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full text-white">ログイン</Button>
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
    </>
  )
}
