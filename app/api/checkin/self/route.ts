import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 会員が自分でチェックイン/チェックアウトするAPI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // 会員情報を取得
    const member = await prisma.member.findFirst({
      where: { userId: session.user.id },
      include: {
        plan: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: '会員情報が見つかりません' },
        { status: 404 }
      )
    }

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: '有効な会員ステータスではありません', status: member.status },
        { status: 403 }
      )
    }

    // 最新のチェックインを確認（チェックアウトしていないもの）
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: {
        memberId: member.id,
        checkedOutAt: null,
      },
      orderBy: { checkedInAt: 'desc' },
    })

    if (latestCheckIn) {
      // チェックアウト処理
      await prisma.checkIn.update({
        where: { id: latestCheckIn.id },
        data: { checkedOutAt: new Date() },
      })

      return NextResponse.json({
        action: 'checkout',
        message: 'チェックアウトしました',
        member: {
          name: `${member.lastName} ${member.firstName}`,
          memberNumber: member.memberNumber,
        },
        checkedOutAt: new Date(),
      })
    } else {
      // チェックイン処理
      const checkIn = await prisma.checkIn.create({
        data: {
          memberId: member.id,
          method: 'qr', // セルフQRチェックイン
        },
      })

      return NextResponse.json({
        action: 'checkin',
        message: 'チェックインしました',
        member: {
          name: `${member.lastName} ${member.firstName}`,
          memberNumber: member.memberNumber,
          plan: member.plan?.name,
        },
        checkedInAt: checkIn.checkedInAt,
      })
    }
  } catch (error) {
    console.error('Self check-in error:', error)
    return NextResponse.json(
      { error: 'チェックイン処理に失敗しました' },
      { status: 500 }
    )
  }
}
