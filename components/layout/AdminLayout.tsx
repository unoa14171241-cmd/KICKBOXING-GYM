'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar, QrCode, ShoppingBag, 
  CalendarDays, Settings, LogOut, Menu, X,
  Flame, Bell, UserCog, Package, CreditCard
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/admin/members', icon: Users, label: '会員管理' },
  { href: '/admin/reservations', icon: Calendar, label: '予約管理' },
  { href: '/admin/checkin', icon: QrCode, label: 'チェックイン' },
  { href: '/admin/trainers', icon: UserCog, label: 'トレーナー管理' },
  { href: '/admin/plans', icon: CreditCard, label: 'プラン管理' },
  { href: '/admin/products', icon: Package, label: '商品管理' },
  { href: '/admin/events', icon: CalendarDays, label: 'イベント管理' },
  { href: '/admin/settings', icon: Settings, label: '設定' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
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
          <div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              BLAZE
            </span>
            <p className="text-xs text-dark-400">管理画面</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
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
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-dark-400">{session?.user?.role}</p>
              </div>
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
