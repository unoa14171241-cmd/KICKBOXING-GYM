'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, Button, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { formatDate, getDayOfWeekLabel } from '@/lib/utils'

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string
  imageUrl: string | null
}

interface TimeSlot {
  time: string
  available: boolean
}

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: true },
  { time: '12:00', available: false },
  { time: '13:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
  { time: '18:00', available: true },
  { time: '19:00', available: true },
  { time: '20:00', available: true },
  { time: '21:00', available: false },
]

export default function ReservePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // トレーナー一覧を取得
    fetch('/api/trainers')
      .then(res => res.json())
      .then(data => setTrainers(data.trainers || []))
      .catch(console.error)
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // 前月の空白
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // 当月の日付
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const handleSubmit = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) return

    setIsLoading(true)
    try {
      const endHour = parseInt(selectedTime.split(':')[0]) + 1
      const endTime = `${endHour.toString().padStart(2, '0')}:00`

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: selectedTrainer.id,
          date: selectedDate.toISOString(),
          startTime: selectedTime,
          endTime,
        }),
      })

      if (res.ok) {
        router.push('/dashboard/reservations?success=true')
      } else {
        const data = await res.json()
        alert(data.error || '予約に失敗しました')
      }
    } catch (error) {
      alert('予約処理中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'トレーナー選択' },
            { num: 2, label: '日時選択' },
            { num: 3, label: '確認' },
          ].map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s.num
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {index < 2 && (
                <div className={`w-16 h-1 mx-4 rounded ${step > s.num ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Trainer Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-primary-500" />
                トレーナーを選択
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {trainers.length > 0 ? (
                  trainers.map((trainer) => (
                    <button
                      key={trainer.id}
                      onClick={() => setSelectedTrainer(trainer)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTrainer?.id === trainer.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {trainer.lastName} {trainer.firstName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {trainer.specialization || 'キックボクシング'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>トレーナーを読み込み中...</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedTrainer}
                >
                  次へ
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-500" />
                日時を選択
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-gray-900 font-semibold">
                      {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <div 
                        key={day} 
                        className={`text-center text-sm py-2 font-medium ${
                          index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                      const dayOfWeek = date?.getDay()
                      return (
                        <button
                          key={index}
                          onClick={() => date && isDateSelectable(date) && setSelectedDate(date)}
                          disabled={!date || !isDateSelectable(date)}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all
                            ${!date ? 'invisible' : ''}
                            ${date && isDateSelectable(date)
                              ? selectedDate?.toDateString() === date.toDateString()
                                ? 'bg-primary-500 text-white'
                                : dayOfWeek === 0
                                  ? 'text-red-500 hover:bg-red-50'
                                  : dayOfWeek === 6
                                    ? 'text-blue-500 hover:bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 cursor-not-allowed'
                            }
                          `}
                        >
                          {date?.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    時間を選択
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`
                          py-3 rounded-lg text-sm font-medium transition-all
                          ${slot.available
                            ? selectedTime === slot.time
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  戻る
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                >
                  次へ
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Check className="w-6 h-6 text-primary-500" />
                予約内容の確認
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                  <span className="text-gray-500">トレーナー</span>
                  <span className="text-gray-900 font-medium">
                    {selectedTrainer?.lastName} {selectedTrainer?.firstName}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                  <span className="text-gray-500">日付</span>
                  <span className="text-gray-900 font-medium">
                    {selectedDate && formatDate(selectedDate)}（{getDayOfWeekLabel(selectedDate?.getDay() || 0)}）
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                  <span className="text-gray-500">時間</span>
                  <span className="text-gray-900 font-medium">
                    {selectedTime} - {parseInt(selectedTime?.split(':')[0] || '0') + 1}:00
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-50 border border-primary-200 mb-6">
                <p className="text-sm text-primary-700">
                  予約後のキャンセルは予約日の24時間前まで可能です。<br />
                  振替は同月内で1回まで可能です。
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  戻る
                </Button>
                <Button onClick={handleSubmit} isLoading={isLoading}>
                  予約を確定する
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
