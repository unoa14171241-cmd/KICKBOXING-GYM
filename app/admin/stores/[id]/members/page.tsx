'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { motion } from 'framer-motion';
import { Users, Search, Filter, AlertTriangle, Phone, Mail } from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  phone: string;
  memberNumber: string;
  status: string;
  joinedAt: string;
  expiresAt: string | null;
  remainingSessions: number;
  plan: { id: string; name: string; price: number } | null;
  user: { email: string };
  _count: { checkIns: number; reservations: number };
}

interface Store {
  id: string;
  name: string;
}

export default function StoreMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [store, setStore] = useState<Store | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchStoreAndMembers();
    }
  }, [params.id]);

  const fetchStoreAndMembers = async () => {
    try {
      const [storeRes, membersRes] = await Promise.all([
        fetch(`/api/admin/stores/${params.id}`),
        fetch(`/api/admin/stores/${params.id}/members`),
      ]);

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStore(storeData);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (memberStatus: string) => {
    switch (memberStatus) {
      case 'active': return <Badge variant="success" className="text-[10px]">有効</Badge>;
      case 'suspended': return <Badge variant="warning" className="text-[10px]">休会</Badge>;
      case 'cancelled': return <Badge variant="danger" className="text-[10px]">退会</Badge>;
      default: return <Badge className="text-[10px]">{memberStatus}</Badge>;
    }
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredMembers = members.filter(m => {
    // 検索フィルタ
    const searchMatch = searchTerm === '' ||
      m.firstName.includes(searchTerm) ||
      m.lastName.includes(searchTerm) ||
      m.firstNameKana.includes(searchTerm) ||
      m.lastNameKana.includes(searchTerm) ||
      m.memberNumber.includes(searchTerm) ||
      m.phone.includes(searchTerm) ||
      m.user.email.includes(searchTerm);

    // ステータスフィルタ
    let statusMatch = true;
    if (statusFilter === 'active') statusMatch = m.status === 'active';
    else if (statusFilter === 'suspended') statusMatch = m.status === 'suspended';
    else if (statusFilter === 'cancelled') statusMatch = m.status === 'cancelled';
    else if (statusFilter === 'expiring') statusMatch = isExpiringSoon(m.expiresAt);
    else if (statusFilter === 'expired') statusMatch = isExpired(m.expiresAt);

    return searchMatch && statusMatch;
  });

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
              {store?.name} - 会員管理
            </h1>
            <p className="text-xs text-gray-500">{filteredMembers.length}名</p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push(`/admin/members/new?storeId=${params.id}`)}
            className="text-xs"
          >
            新規会員登録
          </Button>
        </div>

        {/* 検索・フィルタ */}
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="名前・電話番号・会員番号で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg"
            >
              <option value="all">全て</option>
              <option value="active">有効</option>
              <option value="suspended">休会</option>
              <option value="cancelled">退会</option>
              <option value="expiring">期限切れ間近</option>
              <option value="expired">期限切れ</option>
            </select>
          </div>
        </Card>

        {/* 会員一覧 */}
        <div className="space-y-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => {
              const expiringSoon = isExpiringSoon(member.expiresAt);
              const expired = isExpired(member.expiresAt);
              const hasAlert = expiringSoon || expired || member.status !== 'active';

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      hasAlert ? 'border-l-4 border-l-orange-400' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">
                            {member.lastName} {member.firstName}
                          </span>
                          {getStatusBadge(member.status)}
                          {expired && <Badge variant="danger" className="text-[10px]">期限切れ</Badge>}
                          {expiringSoon && <Badge variant="warning" className="text-[10px]">まもなく期限</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="font-mono">{member.memberNumber}</span>
                          <span>•</span>
                          <span>{member.plan?.name || '未設定'}</span>
                          {member.expiresAt && (
                            <>
                              <span>•</span>
                              <span>
                                期限: {new Date(member.expiresAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs text-gray-500">来店 {member._count.checkIns}回</p>
                        <p className="text-xs text-gray-400">予約 {member._count.reservations}件</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">該当する会員がいません</p>
            </Card>
          )}
        </div>

        {/* 会員詳細モーダル */}
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title="会員詳細"
        >
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedMember.lastName} {selectedMember.firstName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedMember.lastNameKana} {selectedMember.firstNameKana}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">会員番号</p>
                  <p className="font-mono text-gray-900">{selectedMember.memberNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">ステータス</p>
                  <div>{getStatusBadge(selectedMember.status)}</div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">プラン</p>
                  <p className="text-gray-900">{selectedMember.plan?.name || '未設定'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">残りセッション</p>
                  <p className="text-gray-900">{selectedMember.remainingSessions}回</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">入会日</p>
                  <p className="text-gray-900">
                    {new Date(selectedMember.joinedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">有効期限</p>
                  <p className={`${isExpired(selectedMember.expiresAt) ? 'text-red-500' : 'text-gray-900'}`}>
                    {selectedMember.expiresAt
                      ? new Date(selectedMember.expiresAt).toLocaleDateString('ja-JP')
                      : '未設定'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <a
                  href={`tel:${selectedMember.phone}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  {selectedMember.phone}
                </a>
                <a
                  href={`mailto:${selectedMember.user.email}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  {selectedMember.user.email}
                </a>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-sm"
                  onClick={() => {
                    router.push(`/admin/members/${selectedMember.id}`);
                    setSelectedMember(null);
                  }}
                >
                  詳細を見る
                </Button>
                <Button
                  className="flex-1 text-sm"
                  onClick={() => {
                    router.push(`/admin/members/${selectedMember.id}/edit`);
                    setSelectedMember(null);
                  }}
                >
                  編集
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
