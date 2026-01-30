import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const member = await prisma.member.findFirst({
      where: { userId: session.user.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: '会員情報が見つかりません' },
        { status: 404 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      )
    }

    if (reservation.memberId !== member.id) {
      return NextResponse.json(
        { error: 'この予約を振替する権限がありません' },
        { status: 403 }
      )
    }

    if (reservation.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'この予約は振替できません' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { trainerId, date, startTime, endTime } = body

    // 元の予約をキャンセル
    await prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    })

    // 新しい予約を作成
    const newReservation = await prisma.reservation.create({
      data: {
        memberId: member.id,
        trainerId: trainerId || reservation.trainerId,
        date: new Date(date),
        startTime,
        endTime,
        status: 'confirmed',
        isRescheduled: true,
        originalReservationId: params.id,
      },
      include: {
        trainer: true,
      },
    })

    return NextResponse.json({ reservation: newReservation })
  } catch (error) {
    console.error('Error rescheduling reservation:', error)
    return NextResponse.json(
      { error: '予約の振替に失敗しました' },
      { status: 500 }
    )
  }
}
