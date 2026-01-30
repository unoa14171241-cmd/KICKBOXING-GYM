import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
      include: {
        plan: true,
        reservations: {
          where: {
            date: { gte: new Date() },
            status: { in: ['confirmed'] },
          },
          include: {
            trainer: true,
          },
          orderBy: { date: 'asc' },
          take: 5,
        },
        checkIns: {
          orderBy: { checkedInAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: '会員情報が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: '会員情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}
