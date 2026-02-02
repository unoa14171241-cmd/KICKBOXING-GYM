'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
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
  _count: {
    members: number;
    trainers: number;
    staff: number;
  };
}

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    postalCode: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role && !['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/admin/stores');
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (error) {
      console.error('店舗取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        code: store.code,
        address: store.address,
        postalCode: store.postalCode || '',
        phone: store.phone || '',
        email: store.email || '',
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        code: '',
        address: '',
        postalCode: '',
        phone: '',
        email: '',
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingStore
        ? `/api/admin/stores/${editingStore.id}`
        : '/api/admin/stores';
      
      const res = await fetch(url, {
        method: editingStore ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchStores();
      } else {
        const data = await res.json();
        setError(data.error || '保存に失敗しました');
      }
    } catch (error) {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store: Store) => {
    if (!confirm(`${store.name}を削除してもよろしいですか？`)) return;

    try {
      const res = await fetch(`/api/admin/stores/${store.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchStores();
      } else {
        const data = await res.json();
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      alert('削除に失敗しました');
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

  const isOwner = session?.user?.role === 'owner';

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">店舗管理</h1>
            <p className="text-sm text-gray-600 mt-1">店舗の登録・編集・スタッフ管理</p>
          </div>
          {isOwner && (
            <Button onClick={() => openModal()}>
              新規店舗登録
            </Button>
          )}
        </div>

        {/* 店舗一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                      <Badge variant={store.isActive ? 'success' : 'danger'}>
                        {store.isActive ? '営業中' : '休止中'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">コード: {store.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/admin/stores/${store.id}`)}
                    >
                      詳細
                    </Button>
                    {isOwner && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openModal(store)}
                      >
                        編集
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-16 shrink-0">住所:</span>
                    <span>{store.postalCode && `〒${store.postalCode} `}{store.address}</span>
                  </div>
                  {store.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-16 shrink-0">電話:</span>
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-16 shrink-0">Email:</span>
                      <span>{store.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-red-500">{store._count.members}</p>
                    <p className="text-xs text-gray-500">会員数</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-500">{store._count.trainers}</p>
                    <p className="text-xs text-gray-500">トレーナー</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-500">{store._count.staff}</p>
                    <p className="text-xs text-gray-500">スタッフ</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/admin/stores/${store.id}/staff`)}
                  >
                    スタッフ管理
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/admin/stores/${store.id}/sales`)}
                  >
                    売上実績
                  </Button>
                  {isOwner && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(store)}
                    >
                      削除
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {stores.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">店舗が登録されていません</p>
            {isOwner && (
              <Button className="mt-4" onClick={() => openModal()}>
                最初の店舗を登録
              </Button>
            )}
          </Card>
        )}

        {/* 新規登録/編集モーダル */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingStore ? '店舗編集' : '新規店舗登録'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="店舗名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="TRIMGYM つくば"
              required
            />

            <Input
              label="店舗コード"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="tsukuba"
              disabled={!!editingStore}
              required
            />

            <Input
              label="郵便番号"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="305-0032"
            />

            <Input
              label="住所"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="茨城県つくば市竹園2-11-15"
              required
            />

            <Input
              label="電話番号"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="029-XXX-XXXX"
            />

            <Input
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tsukuba@trimgym.com"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
