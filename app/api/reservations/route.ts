import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { memberId: member.id }
    
    if (status) {
      where.status = status
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        trainer: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: '予約情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: '予約するには有効な会員ステータスが必要です' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { trainerId, date, startTime, endTime, scheduleId } = body

    // 残りセッション数のチェック
    if (member.remainingSessions <= 0 && member.plan?.sessionsPerMonth !== 0) {
      return NextResponse.json(
        { error: '今月の利用可能セッション数が残っていません' },
        { status: 400 }
      )
    }

    // 同じ日時に既存の予約がないかチェック
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        memberId: member.id,
        date: new Date(date),
        startTime,
        status: { in: ['confirmed'] },
      },
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: 'この日時には既に予約があります' },
        { status: 400 }
      )
    }

    // 予約を作成
    const reservation = await prisma.reservation.create({
      data: {
        memberId: member.id,
        trainerId,
        scheduleId,
        date: new Date(date),
        startTime,
        endTime,
        status: 'confirmed',
      },
      include: {
        trainer: true,
      },
    })

    // セッション数を減らす（無制限プランでない場合）
    if (member.plan?.sessionsPerMonth !== 0) {
      await prisma.member.update({
        where: { id: member.id },
        data: { remainingSessions: { decrement: 1 } },
      })
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: '予約の作成に失敗しました' },
      { status: 500 }
    )
  }
}
