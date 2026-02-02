'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';
import {
  Users, Calendar, Clock, AlertTriangle, TrendingUp,
  UserPlus, CheckCircle, XCircle, ArrowRight, RefreshCw
} from 'lucide-react';

interface DashboardData {
  store: { id: string; name: string; code: string };
  accessibleStores: { id: string; name: string; code: string }[];
  stats: {
    todayReservations: number;
    todayCheckIns: number;
    currentlyCheckedIn: number;
    totalMembers: number;
    activeMembers: number;
    monthSales: number;
    newMembersThisMonth: number;
    expiringMembersCount: number;
    recentCancellationsCount: number;
  };
  todayReservations: {
    id: string;
    time: string;
    endTime: string;
    status: string;
    member: { id: string; name: string; phone: string; status: string; hasAlert: boolean };
    trainer: { id: string; name: string };
  }[];
  currentlyCheckedIn: {
    id: string;
    checkedInAt: string;
    durationText: string;
    duration: number;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      memberNumber: string;
      status: string;
      plan: { name: string } | null;
    };
    alerts: { expired: boolean; suspended: boolean; longStay: boolean };
  }[];
  expiringMembers: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
    expiresAt: string;
    plan: { name: string } | null;
  }[];
  recentCancellations: {
    id: string;
    date: string;
    status: string;
    memberName: string;
    trainerName: string;
    updatedAt: string;
  }[];
}

export default function StoreDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchDashboard();
    }
  }, [params.id]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store-manager/dashboard?storeId=${params.id}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const err = await res.json();
        setError(err.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success" className="text-xs">確定</Badge>;
      case 'completed': return <Badge variant="info" className="text-xs">完了</Badge>;
      case 'cancelled': return <Badge variant="danger" className="text-xs">キャンセル</Badge>;
      case 'no_show': return <Badge variant="warning" className="text-xs">無断キャンセル</Badge>;
      default: return <Badge className="text-xs">{status}</Badge>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin/stores')}>店舗一覧に戻る</Button>
        </Card>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const hasAlerts = data.stats.expiringMembersCount > 0 || 
    data.stats.recentCancellationsCount > 0 ||
    data.currentlyCheckedIn.some(c => c.alerts.expired || c.alerts.suspended);

  return (
    <AdminLayout>
      <div className="space-y-3 md:space-y-4">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/stores')}
                className="text-xs px-2 py-1"
              >
                ← 店舗一覧
              </Button>
              {data.accessibleStores.length > 1 && (
                <select
                  value={data.store.id}
                  onChange={(e) => router.push(`/admin/stores/${e.target.value}/dashboard`)}
                  className="text-xs px-2 py-1 border rounded-lg"
                >
                  {data.accessibleStores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mt-1">{data.store.name}</h1>
            <p className="text-xs text-gray-500">店舗ダッシュボード</p>
          </div>
          <Button size="sm" onClick={fetchDashboard} className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />更新
          </Button>
        </div>

        {/* 要対応アラート */}
        {hasAlerts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">要対応</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {data.stats.expiringMembersCount > 0 && (
                  <span className="px-2 py-1 bg-red-100 rounded">
                    期限切れ間近: {data.stats.expiringMembersCount}名
                  </span>
                )}
                {data.stats.recentCancellationsCount > 0 && (
                  <span className="px-2 py-1 bg-orange-100 rounded">
                    直近キャンセル: {data.stats.recentCancellationsCount}件
                  </span>
                )}
                {data.currentlyCheckedIn.some(c => c.alerts.expired || c.alerts.suspended) && (
                  <span className="px-2 py-1 bg-yellow-100 rounded">
                    要確認会員が来店中
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: '本日予約', value: data.stats.todayReservations, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: '来店数', value: data.stats.todayCheckIns, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: '滞在中', value: data.stats.currentlyCheckedIn, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: '会員数', value: data.stats.activeMembers, icon: Users, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: '今月売上', value: formatCurrency(data.stats.monthSales), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', isText: true },
            { label: '新規', value: data.stats.newMembersThisMonth, icon: UserPlus, color: 'text-pink-500', bg: 'bg-pink-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`p-2 md:p-3 ${stat.bg}`}>
                <div className="flex items-center gap-1 mb-1">
                  <stat.icon className={`w-3 h-3 ${stat.color}`} />
                  <span className="text-[10px] md:text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <p className={`text-sm md:text-lg font-bold ${stat.color}`}>
                  {stat.isText ? stat.value : stat.value.toLocaleString()}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* 今日の予約 */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                今日の予約
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/stores/${params.id}/reservations`)}
                className="text-[10px] px-2 py-1"
              >
                すべて表示
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {data.todayReservations.length > 0 ? (
                data.todayReservations.slice(0, 8).map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      r.member.hasAlert ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-gray-600 shrink-0">{r.time}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{r.member.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{r.trainer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {r.member.hasAlert && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      {getStatusBadge(r.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-xs">本日の予約はありません</p>
              )}
            </div>
          </Card>

          {/* 現在チェックイン中 */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-500" />
                滞在中 ({data.currentlyCheckedIn.length}名)
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/stores/${params.id}/checkin`)}
                className="text-[10px] px-2 py-1"
              >
                チェックイン管理
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {data.currentlyCheckedIn.length > 0 ? (
                data.currentlyCheckedIn.map((ci) => {
                  const hasAlert = ci.alerts.expired || ci.alerts.suspended || ci.alerts.longStay;
                  return (
                    <div
                      key={ci.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        hasAlert ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {ci.member.lastName} {ci.member.firstName}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {ci.member.plan?.name || '未設定'} • {ci.member.memberNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {ci.alerts.expired && (
                          <Badge variant="danger" className="text-[10px]">期限切れ</Badge>
                        )}
                        {ci.alerts.suspended && (
                          <Badge variant="warning" className="text-[10px]">休会中</Badge>
                        )}
                        {ci.alerts.longStay && (
                          <Badge variant="info" className="text-[10px]">長時間</Badge>
                        )}
                        <span className="text-gray-500 font-mono">{ci.durationText}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 py-4 text-xs">現在滞在中の会員はいません</p>
              )}
            </div>
          </Card>

          {/* 期限切れ間近 */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                期限切れ間近
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/stores/${params.id}/members?filter=expiring`)}
                className="text-[10px] px-2 py-1"
              >
                すべて表示
              </Button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {data.expiringMembers.length > 0 ? (
                data.expiringMembers.slice(0, 5).map((m) => {
                  const daysLeft = Math.ceil(
                    (new Date(m.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-orange-50 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {m.lastName} {m.firstName}
                        </p>
                        <p className="text-[10px] text-gray-500">{m.plan?.name || '未設定'}</p>
                      </div>
                      <Badge
                        variant={daysLeft <= 7 ? 'danger' : 'warning'}
                        className="text-[10px] shrink-0"
                      >
                        残{daysLeft}日
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 py-4 text-xs">期限切れ間近の会員はいません</p>
              )}
            </div>
          </Card>

          {/* 直近のキャンセル */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                直近のキャンセル
              </h2>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {data.recentCancellations.length > 0 ? (
                data.recentCancellations.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{c.memberName}</p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(c.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        {' • '}{c.trainerName}
                      </p>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-xs">直近のキャンセルはありません</p>
              )}
            </div>
          </Card>
        </div>

        {/* クイックアクション */}
        <Card className="p-3">
          <h2 className="text-sm font-bold text-gray-900 mb-2">クイックアクション</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { label: 'チェックイン', icon: CheckCircle, href: `/admin/stores/${params.id}/checkin`, color: 'bg-green-100 text-green-600' },
              { label: '予約管理', icon: Calendar, href: `/admin/stores/${params.id}/reservations`, color: 'bg-blue-100 text-blue-600' },
              { label: '会員管理', icon: Users, href: `/admin/stores/${params.id}/members`, color: 'bg-purple-100 text-purple-600' },
              { label: '売上登録', icon: TrendingUp, href: `/admin/stores/${params.id}/sales`, color: 'bg-emerald-100 text-emerald-600' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`p-2 md:p-3 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
              >
                <action.icon className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1" />
                <span className="text-[10px] md:text-xs block">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
