import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrCode, method = 'qr' } = body

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QRコードが必要です' },
        { status: 400 }
      )
    }

    // QRコードで会員を検索
    const member = await prisma.member.findUnique({
      where: { qrCode },
      include: {
        user: true,
        plan: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: '会員が見つかりません' },
        { status: 404 }
      )
    }

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: '有効な会員ステータスではありません', status: member.status },
        { status: 403 }
      )
    }

    // 最新のチェックインを確認
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
          method,
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
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'チェックイン処理に失敗しました' },
      { status: 500 }
    )
  }
}
