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
      include: { plan: true },
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
        { error: 'この予約をキャンセルする権限がありません' },
        { status: 403 }
      )
    }

    if (reservation.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'この予約はキャンセルできません' },
        { status: 400 }
      )
    }

    // キャンセル
    await prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    })

    // セッション数を戻す（無制限プランでない場合）
    if (member.plan?.sessionsPerMonth !== 0) {
      await prisma.member.update({
        where: { id: member.id },
        data: { remainingSessions: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    return NextResponse.json(
      { error: '予約のキャンセルに失敗しました' },
      { status: 500 }
    )
  }
}
