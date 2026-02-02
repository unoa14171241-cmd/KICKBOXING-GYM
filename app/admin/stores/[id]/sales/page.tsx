'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { motion } from 'framer-motion';

interface SalesRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

interface SalesSummary {
  type: string;
  _sum: {
    amount: number | null;
  };
  _count: number;
}

interface Store {
  id: string;
  name: string;
  code: string;
}

const SALES_TYPES = [
  { value: 'membership', label: '会費', color: 'bg-blue-500' },
  { value: 'product', label: '物販', color: 'bg-green-500' },
  { value: 'lesson', label: 'パーソナル', color: 'bg-purple-500' },
  { value: 'event', label: 'イベント', color: 'bg-orange-500' },
  { value: 'other', label: 'その他', color: 'bg-gray-500' },
];

export default function StoreSalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [summary, setSummary] = useState<SalesSummary[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'membership',
    amount: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      fetchSales();
    }
  }, [params.id, filterType, startDate, endDate]);

  const fetchStore = async () => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStore(data);
      }
    } catch (error) {
      console.error('店舗情報取得エラー:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterType) queryParams.set('type', filterType);
      if (startDate) queryParams.set('startDate', startDate);
      if (endDate) queryParams.set('endDate', endDate);

      const res = await fetch(`/api/admin/stores/${params.id}/sales?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setSummary(data.summary);
        setTotalAmount(data.totalAmount);
      }
    } catch (error) {
      console.error('売上データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'membership',
      amount: '',
      description: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/stores/${params.id}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSales();
      } else {
        const data = await res.json();
        setError(data.error || '売上の登録に失敗しました');
      }
    } catch (error) {
      setError('売上の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: SalesRecord) => {
    if (!confirm('この売上記録を削除してもよろしいですか？')) return;

    try {
      const res = await fetch(`/api/admin/stores/${params.id}/sales?recordId=${record.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSales();
      } else {
        const data = await res.json();
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const getTypeInfo = (type: string) => {
    return SALES_TYPES.find((t) => t.value === type) || SALES_TYPES[4];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
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

  const isManager = session?.user?.role === 'owner' || session?.user?.role === 'store_manager';

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
              {store?.name} - 売上実績
            </h1>
            <p className="text-sm text-gray-600 mt-1">売上の記録・集計</p>
          </div>
          <Button onClick={openModal}>
            売上登録
          </Button>
        </div>

        {/* 売上集計 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 md:col-span-3 lg:col-span-1"
          >
            <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <p className="text-xs opacity-80">合計売上</p>
              <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
            </Card>
          </motion.div>
          {SALES_TYPES.map((type, index) => {
            const summaryItem = summary.find((s) => s.type === type.value);
            const amount = summaryItem?._sum?.amount || 0;
            return (
              <motion.div
                key={type.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
              >
                <Card className="p-4">
                  <p className="text-xs text-gray-500">{type.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(amount)}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* フィルター */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">種別</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">すべて</option>
                {SALES_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">終了日</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilterType('');
                setStartDate('');
                setEndDate('');
              }}
            >
              クリア
            </Button>
          </div>
        </Card>

        {/* 売上一覧 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">日付</th>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">種別</th>
                  <th className="text-right p-3 md:p-4 font-medium text-gray-600">金額</th>
                  <th className="text-left p-3 md:p-4 font-medium text-gray-600">説明</th>
                  {isManager && (
                    <th className="text-right p-3 md:p-4 font-medium text-gray-600">操作</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record, index) => {
                  const typeInfo = getTypeInfo(record.type);
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="p-3 md:p-4 text-gray-900">
                        {new Date(record.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="p-3 md:p-4">
                        <Badge className={`${typeInfo.color} text-white`}>
                          {typeInfo.label}
                        </Badge>
                      </td>
                      <td className="p-3 md:p-4 text-right font-medium text-gray-900">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="p-3 md:p-4 text-gray-600">
                        {record.description || '-'}
                      </td>
                      {isManager && (
                        <td className="p-3 md:p-4 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(record)}
                          >
                            削除
                          </Button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {records.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">売上データがありません</p>
              <Button className="mt-4" onClick={openModal}>
                最初の売上を登録
              </Button>
            </div>
          )}
        </Card>

        {/* 新規登録モーダル */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="売上登録"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="日付"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種別
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {SALES_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="金額（円）"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="11000"
              required
            />

            <Input
              label="説明（任意）"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="例：田中様 入会金"
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
                {saving ? '登録中...' : '登録'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
