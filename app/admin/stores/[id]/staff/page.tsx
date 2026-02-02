'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { motion } from 'framer-motion';

interface StoreStaff {
  id: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

interface Store {
  id: string;
  name: string;
  code: string;
}

export default function StoreStaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [staff, setStaff] = useState<StoreStaff[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role && !['owner', 'store_manager'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (params.id) {
      fetchStoreAndStaff();
    }
  }, [params.id]);

  const fetchStoreAndStaff = async () => {
    try {
      const [storeRes, staffRes] = await Promise.all([
        fetch(`/api/admin/stores/${params.id}`),
        fetch(`/api/admin/stores/${params.id}/staff`),
      ]);

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStore(storeData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      email: '',
      password: '',
      role: 'staff',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/stores/${params.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchStoreAndStaff();
      } else {
        const data = await res.json();
        setError(data.error || 'スタッフの追加に失敗しました');
      }
    } catch (error) {
      setError('スタッフの追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staffMember: StoreStaff) => {
    if (!confirm(`${staffMember.user.email}をスタッフから削除してもよろしいですか？`)) return;

    try {
      const res = await fetch(`/api/admin/stores/${params.id}/staff?staffId=${staffMember.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchStoreAndStaff();
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
                onClick={() => router.push(`/admin/stores/${params.id}`)}
              >
                ← 戻る
              </Button>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
              {store?.name} - スタッフ管理
            </h1>
            <p className="text-sm text-gray-600 mt-1">スタッフの追加・削除</p>
          </div>
          <Button onClick={openModal}>
            新規スタッフ追加
          </Button>
        </div>

        {/* スタッフ一覧 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">メールアドレス</th>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">役割</th>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">状態</th>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">登録日</th>
                  <th className="text-right p-3 md:p-4 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((staffMember, index) => (
                  <motion.tr
                    key={staffMember.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-3 md:p-4 text-gray-900">{staffMember.user.email}</td>
                    <td className="p-3 md:p-4">
                      <Badge variant={staffMember.role === 'manager' ? 'info' : 'default'}>
                        {staffMember.role === 'manager' ? '店舗管理者' : 'スタッフ'}
                      </Badge>
                    </td>
                    <td className="p-3 md:p-4">
                      <Badge variant={staffMember.isActive ? 'success' : 'danger'}>
                        {staffMember.isActive ? '有効' : '無効'}
                      </Badge>
                    </td>
                    <td className="p-3 md:p-4 text-gray-600">
                      {new Date(staffMember.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(staffMember)}
                      >
                        削除
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {staff.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">スタッフが登録されていません</p>
              <Button className="mt-4" onClick={openModal}>
                最初のスタッフを追加
              </Button>
            </div>
          )}
        </Card>

        {/* 新規登録モーダル */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="新規スタッフ追加"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff@example.com"
              required
            />

            <Input
              label="パスワード"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="8文字以上"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                役割
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="staff">スタッフ</option>
                <option value="manager">店舗管理者</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                店舗管理者はスタッフの追加・削除、売上管理ができます
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '追加中...' : '追加'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
