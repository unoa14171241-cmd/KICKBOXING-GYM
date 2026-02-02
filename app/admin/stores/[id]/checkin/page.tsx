'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { motion } from 'framer-motion';
import {
  QrCode, Search, Users, Clock, AlertTriangle,
  LogIn, LogOut, RefreshCw, User
} from 'lucide-react';

interface CheckInRecord {
  id: string;
  checkedInAt: string;
  checkedOutAt: string | null;
  method: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
    phone: string;
    status: string;
    expiresAt: string | null;
    plan: { name: string } | null;
  };
}

interface Store {
  id: string;
  name: string;
}

export default function StoreCheckinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [currentlyIn, setCurrentlyIn] = useState<CheckInRecord[]>([]);
  const [todayHistory, setTodayHistory] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchData();
      // 30秒ごとに自動更新
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}/checkin`);
      if (res.ok) {
        const data = await res.json();
        setStore(data.store);
        setCurrentlyIn(data.currentlyIn);
        setTodayHistory(data.todayHistory);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/stores/${params.id}/members/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, method: 'manual' }),
      });

      if (res.ok) {
        fetchData();
        setSearchTerm('');
        setSearchResults([]);
      } else {
        const data = await res.json();
        alert(data.error || 'チェックインに失敗しました');
      }
    } catch (error) {
      alert('チェックインに失敗しました');
    }
  };

  const handleCheckOut = async (checkInId: string) => {
    try {
      const res = await fetch(`/api/admin/stores/${params.id}/checkin/${checkInId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '退館処理に失敗しました');
      }
    } catch (error) {
      alert('退館処理に失敗しました');
    }
  };

  const getDuration = (checkedInAt: string) => {
    const duration = Math.floor((Date.now() - new Date(checkedInAt).getTime()) / 60000);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
  };

  const hasAlert = (record: CheckInRecord) => {
    const isExpired = record.member.expiresAt && new Date(record.member.expiresAt) < new Date();
    const isSuspended = record.member.status !== 'active';
    return isExpired || isSuspended;
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
              {store?.name} - チェックイン管理
            </h1>
            <p className="text-xs text-gray-500">滞在中: {currentlyIn.length}名</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={fetchData} variant="secondary" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />更新
            </Button>
            <Button size="sm" onClick={() => setShowQrModal(true)} className="text-xs">
              <QrCode className="w-3 h-3 mr-1" />QR表示
            </Button>
          </div>
        </div>

        {/* 検索・手動チェックイン */}
        <Card className="p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="会員番号・名前・電話番号で検索してチェックイン"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg"
              />
            </div>
            <Button size="sm" onClick={handleSearch} disabled={searching} className="text-xs">
              {searching ? '検索中...' : '検索'}
            </Button>
          </div>

          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <div className="mt-2 border-t pt-2 space-y-1">
              <p className="text-xs text-gray-500 mb-1">検索結果:</p>
              {searchResults.map((member) => {
                const alreadyIn = currentlyIn.some(c => c.member.id === member.id);
                const isExpired = member.expiresAt && new Date(member.expiresAt) < new Date();
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      isExpired ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.lastName} {member.firstName}
                        {isExpired && <span className="text-red-500 ml-2">※期限切れ</span>}
                      </p>
                      <p className="text-gray-500">{member.memberNumber} • {member.plan?.name || '未設定'}</p>
                    </div>
                    {alreadyIn ? (
                      <Badge variant="info" className="text-[10px]">滞在中</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(member.id)}
                        className="text-[10px] px-2 py-1"
                      >
                        <LogIn className="w-3 h-3 mr-1" />チェックイン
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 現在滞在中 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Users className="w-4 h-4 text-green-500" />
              現在滞在中 ({currentlyIn.length}名)
            </h2>
          </div>

          <div className="space-y-2">
            {currentlyIn.length > 0 ? (
              currentlyIn.map((record, index) => {
                const alert = hasAlert(record);
                const duration = getDuration(record.checkedInAt);
                const isLongStay = (Date.now() - new Date(record.checkedInAt).getTime()) > 3 * 60 * 60 * 1000;

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      alert ? 'bg-red-50 border border-red-200' : isLongStay ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        alert ? 'bg-red-200' : 'bg-green-200'
                      }`}>
                        <User className={`w-4 h-4 ${alert ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {record.member.lastName} {record.member.firstName}
                          </span>
                          {alert && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {record.member.memberNumber} • {record.member.plan?.name || '未設定'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-600">{duration}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(record.checkedInAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCheckOut(record.id)}
                        className="text-[10px] px-2 py-1"
                      >
                        <LogOut className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-gray-400 py-6 text-sm">現在滞在中の会員はいません</p>
            )}
          </div>
        </Card>

        {/* 本日の入退館履歴 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              本日の入退館履歴
            </h2>
            <span className="text-xs text-gray-500">{todayHistory.length}件</span>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {todayHistory.length > 0 ? (
              todayHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {record.member.lastName} {record.member.firstName}
                    </p>
                    <p className="text-gray-500">{record.member.memberNumber}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-gray-600">
                      {new Date(record.checkedInAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      {record.checkedOutAt && (
                        <> 〜 {new Date(record.checkedOutAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </p>
                    <Badge
                      variant={record.checkedOutAt ? 'default' : 'success'}
                      className="text-[10px]"
                    >
                      {record.checkedOutAt ? '退館済' : '滞在中'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4 text-sm">本日の履歴はありません</p>
            )}
          </div>
        </Card>

        {/* QRコードモーダル */}
        <Modal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title="店舗チェックインQRコード"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              会員様がこのQRコードを読み取るとセルフチェックインできます
            </p>
            <div className="bg-white p-4 rounded-lg inline-block border">
              {/* QRコードはstore-qrページへのリンク */}
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-2">
                  /admin/store-qr で印刷用QRを取得できます
                </p>
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                router.push('/admin/store-qr');
                setShowQrModal(false);
              }}
            >
              印刷用ページを開く
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
