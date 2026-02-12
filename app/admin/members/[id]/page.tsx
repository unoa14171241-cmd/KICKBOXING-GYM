'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  ArrowLeft, Edit, Mail, Phone, Calendar,
  CreditCard, Clock, User, MapPin, AlertCircle,
  FileText, Plus, Trash2
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'

interface Member {
  id: string
  firstName: string
  lastName: string
  firstNameKana: string
  lastNameKana: string
  email: string
  phone: string
  memberNumber: string
  status: string
  remainingSessions: number
  joinedAt: string
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  plan: {
    id: string
    name: string
    price: number
  } | null
}

interface TrainingReport {
  id: string
  trainingDate: string
  duration: number | null
  menuItems: string
  trainerComment: string
  nextGoal: string | null
  physicalNote: string | null
  trainer: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string | null
}

export default function MemberDetailPage() {
  const params = useParams()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info')

  // トレーニングレポート関連のstate
  const [reports, setReports] = useState<TrainingReport[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<TrainingReport | null>(null)
  const [reportForm, setReportForm] = useState({
    trainerId: '',
    trainingDate: '',
    duration: '',
    menuItems: '',
    trainerComment: '',
    nextGoal: '',
    physicalNote: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchMember()
      fetchTrainers()
    }
  }, [params.id])

  useEffect(() => {
    if (params.id && activeTab === 'reports') {
      fetchReports()
    }
  }, [params.id, activeTab])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/admin/members/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMember(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/members/${params.id}/training-reports`)
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchTrainers = async () => {
    try {
      const res = await fetch('/api/trainers')
      if (res.ok) {
        const data = await res.json()
        setTrainers(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReportFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setReportForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAddReport = () => {
    setEditingReport(null)
    setReportForm({
      trainerId: '',
      trainingDate: new Date().toISOString().split('T')[0],
      duration: '',
      menuItems: '',
      trainerComment: '',
      nextGoal: '',
      physicalNote: '',
    })
    setIsReportModalOpen(true)
  }

  const handleEditReport = (report: TrainingReport) => {
    setEditingReport(report)
    setReportForm({
      trainerId: report.trainer.id,
      trainingDate: report.trainingDate.split('T')[0],
      duration: report.duration?.toString() || '',
      menuItems: report.menuItems,
      trainerComment: report.trainerComment,
      nextGoal: report.nextGoal || '',
      physicalNote: report.physicalNote || '',
    })
    setIsReportModalOpen(true)
  }

  const handleSaveReport = async () => {
    try {
      const url = editingReport
        ? `/api/training-reports/${editingReport.id}`
        : `/api/members/${params.id}/training-reports`

      const res = await fetch(url, {
        method: editingReport ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          duration: reportForm.duration ? parseInt(reportForm.duration) : null,
        }),
      })

      if (res.ok) {
        fetchReports()
        setIsReportModalOpen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('このレポートを削除しますか?')) return

    try {
      const res = await fetch(`/api/training-reports/${reportId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </AdminLayout>
    )
  }

  if (!member) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">会員が見つかりません</p>
          <Link href="/admin/members">
            <Button variant="secondary" className="mt-4">
              会員一覧に戻る
            </Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/members" className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-bebas)' }}>
                {member.lastName} {member.firstName}
              </h1>
              <p className="text-gray-500">{member.lastNameKana} {member.firstNameKana}</p>
            </div>
          </div>
          <Link href={`/admin/members/${member.id}/edit`}>
            <Button>
              <Edit className="w-5 h-5 mr-2" />
              編集
            </Button>
          </Link>
        </div>

        {/* タブ */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`${activeTab === 'info'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`${activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <FileText className="w-4 h-4" />
              トレーニングレポート
              {reports.length > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs">
                  {reports.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* 基本情報タブ */}
        {activeTab === 'info' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                基本情報
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">会員番号</span>
                  <span className="font-mono text-gray-900">{member.memberNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ステータス</span>
                  <Badge status={member.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">入会日</span>
                  <span className="text-gray-900">{formatDate(member.joinedAt)}</span>
                </div>
                {member.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">生年月日</span>
                    <span className="text-gray-900">{formatDate(member.dateOfBirth)}</span>
                  </div>
                )}
                {member.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">性別</span>
                    <span className="text-gray-900">
                      {member.gender === 'male' ? '男性' : member.gender === 'female' ? '女性' : 'その他'}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* 連絡先 */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-500" />
                連絡先
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">メール</span>
                  <a href={`mailto:${member.email}`} className="text-primary-600 hover:underline">
                    {member.email}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">電話番号</span>
                  <a href={`tel:${member.phone}`} className="text-primary-600 hover:underline">
                    {member.phone}
                  </a>
                </div>
                {member.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">住所</span>
                    <span className="text-gray-900">{member.address}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* プラン情報 */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                プラン情報
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">プラン</span>
                  <span className="text-gray-900">{member.plan?.name || '未設定'}</span>
                </div>
                {member.plan && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">月額</span>
                    <span className="text-gray-900">{formatCurrency(member.plan.price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">残りセッション</span>
                  <span className="text-gray-900">{member.remainingSessions}回</span>
                </div>
              </div>
            </Card>

            {/* 緊急連絡先 */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-500" />
                緊急連絡先
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">氏名</span>
                  <span className="text-gray-900">{member.emergencyContact || '未設定'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">電話番号</span>
                  <span className="text-gray-900">{member.emergencyPhone || '未設定'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* トレーニングレポートタブ */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">トレーニングレポート</h2>
              <Button onClick={handleAddReport}>
                <Plus className="w-5 h-5 mr-2" />
                新規レポート作成
              </Button>
            </div>

            {reports.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">トレーニングレポートはまだありません</p>
                <Button onClick={handleAddReport} variant="secondary" className="mt-4">
                  最初のレポートを作成
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(report.trainingDate)}
                          </h3>
                          {report.duration && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {report.duration}分
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          担当: {report.trainer.lastName} {report.trainer.firstName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReport(report)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">実施メニュー</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{report.menuItems}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">トレーナーコメント</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{report.trainerComment}</p>
                      </div>
                      {report.nextGoal && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">次回の目標</h4>
                          <p className="text-gray-900 whitespace-pre-wrap">{report.nextGoal}</p>
                        </div>
                      )}
                      {report.physicalNote && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">体調・進捗メモ</h4>
                          <p className="text-gray-900 whitespace-pre-wrap">{report.physicalNote}</p>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 pt-2 border-t">
                        作成: {formatDateTime(report.createdAt)}
                        {report.updatedAt !== report.createdAt && ` / 更新: ${formatDateTime(report.updatedAt)}`}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* レポート作成・編集モーダル */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title={editingReport ? 'レポート編集' : '新規レポート作成'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当トレーナー *
                </label>
                <select
                  name="trainerId"
                  value={reportForm.trainerId}
                  onChange={handleReportFormChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">選択してください</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.lastName} {trainer.firstName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  実施日 *
                </label>
                <input
                  type="date"
                  name="trainingDate"
                  value={reportForm.trainingDate}
                  onChange={handleReportFormChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所要時間（分）
              </label>
              <input
                type="number"
                name="duration"
                value={reportForm.duration}
                onChange={handleReportFormChange}
                placeholder="例: 60"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                実施メニュー *
              </label>
              <textarea
                name="menuItems"
                value={reportForm.menuItems}
                onChange={handleReportFormChange}
                rows={4}
                placeholder="例:&#10;- ウォーミングアップ (10分)&#10;- シャドーボクシング (15分)&#10;- ミット打ち (20分)&#10;- クールダウン (5分)"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トレーナーコメント *
              </label>
              <textarea
                name="trainerComment"
                value={reportForm.trainerComment}
                onChange={handleReportFormChange}
                rows={4}
                placeholder="今日のトレーニングの様子、改善点、良かった点など"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                次回の目標
              </label>
              <textarea
                name="nextGoal"
                value={reportForm.nextGoal}
                onChange={handleReportFormChange}
                rows={2}
                placeholder="次回までに意識してほしいポイントなど"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                体調・進捗メモ
              </label>
              <textarea
                name="physicalNote"
                value={reportForm.physicalNote}
                onChange={handleReportFormChange}
                rows={2}
                placeholder="体調、怪我の有無、体重の変化など"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsReportModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleSaveReport}
                disabled={!reportForm.trainerId || !reportForm.trainingDate || !reportForm.menuItems || !reportForm.trainerComment}
              >
                {editingReport ? '更新' : '作成'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}
