'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Clock, User,
  Plus, AlertTriangle, X, Check
} from 'lucide-react';

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
    phone: string;
  };
  trainer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Store {
  id: string;
  name: string;
}

export default function StoreReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id, selectedDate]);

  const fetchData = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [storeRes, reservationsRes] = await Promise.all([
        fetch(`/api/admin/stores/${params.id}`),
        fetch(`/api/admin/stores/${params.id}/reservations?date=${dateStr}`),
      ]);

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStore(storeData);
      }

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getStatusBadge = (reservationStatus: string) => {
    switch (reservationStatus) {
      case 'confirmed': return <Badge variant="success" className="text-[10px]">確定</Badge>;
      case 'completed': return <Badge variant="info" className="text-[10px]">完了</Badge>;
      case 'cancelled': return <Badge variant="danger" className="text-[10px]">キャンセル</Badge>;
      case 'no_show': return <Badge variant="warning" className="text-[10px]">無断キャンセル</Badge>;
      default: return <Badge className="text-[10px]">{reservationStatus}</Badge>;
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}/reservations/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: cancelReason || undefined }),
      });

      if (res.ok) {
        fetchData();
        setSelectedReservation(null);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        const data = await res.json();
        alert(data.error || 'ステータス変更に失敗しました');
      }
    } catch (error) {
      alert('ステータス変更に失敗しました');
    }
  };

  const formatDate = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // 時間帯別にグループ化
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getReservationsForTime = (time: string) => {
    return reservations.filter(r => r.startTime === time || 
      (r.startTime < time && r.endTime > time));
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

  return (
    <AdminLayout>
      <div className="space-y-3 md:space-y-4">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/admin/stores/${params.id}/dashboard`)}
              className="text-xs px-2 py-1 mb-1"
            >
              ← ダッシュボード
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              {store?.name} - 予約管理
            </h1>
          </div>
        </div>

        {/* 日付選択 */}
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <p className={`text-lg font-bold ${isToday ? 'text-red-500' : 'text-gray-900'}`}>
                {formatDate(selectedDate)}
              </p>
              {isToday && <p className="text-xs text-red-500">今日</p>}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs"
            >
              今日
            </Button>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-2 py-1 text-xs border rounded-lg"
            />
          </div>
        </Card>

        {/* 予約タイムライン */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              予約一覧 ({reservations.filter(r => r.status === 'confirmed').length}件)
            </h2>
          </div>

          <div className="space-y-1">
            {timeSlots.map((time, index) => {
              const slotReservations = reservations.filter(r => r.startTime === time);
              const hasReservations = slotReservations.length > 0;

              return (
                <div
                  key={time}
                  className={`flex gap-2 p-2 rounded-lg ${
                    hasReservations ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="w-12 shrink-0 text-xs font-mono text-gray-500">{time}</div>
                  <div className="flex-1 space-y-1">
                    {slotReservations.length > 0 ? (
                      slotReservations.map((r) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                            r.status === 'confirmed' ? 'bg-white border border-blue-200' :
                            r.status === 'cancelled' ? 'bg-gray-100 border border-gray-200 opacity-60' :
                            r.status === 'no_show' ? 'bg-red-50 border border-red-200' :
                            'bg-green-50 border border-green-200'
                          }`}
                          onClick={() => setSelectedReservation(r)}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-medium text-xs text-gray-900">
                                {r.member.lastName} {r.member.firstName}
                              </span>
                              {getStatusBadge(r.status)}
                            </div>
                            <p className="text-[10px] text-gray-500">
                              {r.startTime}〜{r.endTime} • {r.trainer.lastName}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="h-6"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {reservations.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">この日の予約はありません</p>
          )}
        </Card>

        {/* 予約詳細モーダル */}
        <Modal
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          title="予約詳細"
        >
          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedReservation.member.lastName} {selectedReservation.member.firstName}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedReservation.member.memberNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">日時</p>
                  <p className="text-gray-900">
                    {new Date(selectedReservation.date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">時間</p>
                  <p className="text-gray-900">
                    {selectedReservation.startTime} 〜 {selectedReservation.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">担当</p>
                  <p className="text-gray-900">
                    {selectedReservation.trainer.lastName} {selectedReservation.trainer.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">ステータス</p>
                  <div>{getStatusBadge(selectedReservation.status)}</div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div>
                  <p className="text-gray-500 text-xs">メモ</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedReservation.notes}</p>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">ステータス変更</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReservation.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedReservation.id, 'completed')}
                      className="text-xs bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-3 h-3 mr-1" />完了
                    </Button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowCancelModal(true)}
                        className="text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />キャンセル
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(selectedReservation.id, 'no_show')}
                        className="text-xs"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />無断キャンセル
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <a
                href={`tel:${selectedReservation.member.phone}`}
                className="block w-full text-center py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                📞 {selectedReservation.member.phone}
              </a>
            </div>
          )}
        </Modal>

        {/* キャンセル理由モーダル */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancelReason('');
          }}
          title="キャンセル理由"
        >
          <div className="space-y-4">
            <Input
              label="キャンセル理由（任意）"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="例：会員都合によるキャンセル"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                戻る
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  if (selectedReservation) {
                    handleStatusChange(selectedReservation.id, 'cancelled');
                  }
                }}
              >
                キャンセル確定
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
