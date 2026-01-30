'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, QrCode, ShoppingBag, 
  CalendarDays, User, Settings, LogOut, Menu, X,
  Flame, Bell
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const memberNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/dashboard/reserve', icon: Calendar, label: '予約' },
  { href: '/dashboard/reservations', icon: CalendarDays, label: '予約履歴' },
  { href: '/dashboard/member-card', icon: QrCode, label: '会員証' },
  { href: '/dashboard/shop', icon: ShoppingBag, label: 'ショップ' },
  { href: '/dashboard/events', icon: CalendarDays, label: 'イベント' },
  { href: '/dashboard/profile', icon: User, label: 'プロフィール' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-transform duration-300',
        'w-64 glass-dark border-r border-dark-700',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-dark-700">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-orange rounded-lg flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
            BLAZE
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {memberNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
              <User className="w-5 h-5 text-dark-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'ゲスト'}
              </p>
              <p className="text-xs text-dark-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 glass-dark border-b border-dark-700">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors relative">
                <Bell className="w-5 h-5 text-dark-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
              </button>
              <Link href="/" className="text-sm text-dark-400 hover:text-white transition-colors">
                トップページ
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
