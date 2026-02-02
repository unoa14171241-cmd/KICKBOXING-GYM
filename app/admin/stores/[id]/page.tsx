'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';

interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  staff: {
    id: string;
    role: string;
    isActive: boolean;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }[];
  _count: {
    members: number;
    trainers: number;
    checkIns: number;
    orders: number;
    events: number;
  };
}

export default function StoreDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role && !['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (params.id) {
      fetchStore();
    }
  }, [params.id]);

  const fetchStore = async () => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStore(data);
      } else {
        const data = await res.json();
        setError(data.error || '店舗情報の取得に失敗しました');
      }
    } catch (error) {
      setError('店舗情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/admin/stores')}>
            店舗一覧に戻る
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500">店舗が見つかりません</p>
          <Button className="mt-4" onClick={() => router.push('/admin/stores')}>
            店舗一覧に戻る
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/stores')}
              >
                ← 戻る
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{store.name}</h1>
              <Badge variant={store.isActive ? 'success' : 'danger'}>
                {store.isActive ? '営業中' : '休止中'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">店舗コード: {store.code}</p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-red-500">{store._count.members}</p>
              <p className="text-xs md:text-sm text-gray-500">会員数</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-blue-500">{store._count.trainers}</p>
              <p className="text-xs md:text-sm text-gray-500">トレーナー</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-500">{store.staff.length}</p>
              <p className="text-xs md:text-sm text-gray-500">スタッフ</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-purple-500">{store._count.checkIns}</p>
              <p className="text-xs md:text-sm text-gray-500">チェックイン</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-orange-500">{store._count.events}</p>
              <p className="text-xs md:text-sm text-gray-500">イベント</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 店舗情報 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">店舗情報</h2>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">住所</span>
                  <span className="text-gray-900">
                    {store.postalCode && `〒${store.postalCode} `}
                    {store.address}
                  </span>
                </div>
                {store.phone && (
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">電話番号</span>
                    <span className="text-gray-900">{store.phone}</span>
                  </div>
                )}
                {store.email && (
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">メール</span>
                    <span className="text-gray-900">{store.email}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">登録日</span>
                  <span className="text-gray-900">
                    {new Date(store.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* クイックアクション */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">クイックアクション</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/stores/${store.id}/staff`)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-1">👥</span>
                  <span className="text-sm">スタッフ管理</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/stores/${store.id}/sales`)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-1">💰</span>
                  <span className="text-sm">売上実績</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/members?store=${store.id}`)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-1">🏃</span>
                  <span className="text-sm">会員一覧</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/checkin?store=${store.id}`)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-1">✅</span>
                  <span className="text-sm">チェックイン</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* スタッフ一覧（簡易表示） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">スタッフ一覧</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/stores/${store.id}/staff`)}
              >
                全て表示
              </Button>
            </div>
            {store.staff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">メールアドレス</th>
                      <th className="text-left p-3 font-medium text-gray-600">役割</th>
                      <th className="text-left p-3 font-medium text-gray-600">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {store.staff.slice(0, 5).map((staff) => (
                      <tr key={staff.id}>
                        <td className="p-3 text-gray-900">{staff.user.email}</td>
                        <td className="p-3">
                          <Badge variant={staff.role === 'manager' ? 'info' : 'default'}>
                            {staff.role === 'manager' ? '店舗管理者' : 'スタッフ'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={staff.isActive ? 'success' : 'danger'}>
                            {staff.isActive ? '有効' : '無効'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">スタッフが登録されていません</p>
            )}
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
