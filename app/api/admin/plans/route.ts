import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'プランの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, sessionsPerMonth, durationMonths, isActive, sortOrder } = body

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price,
        sessionsPerMonth,
        durationMonths: durationMonths || 1,
        isActive,
        sortOrder,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'プランの作成に失敗しました' }, { status: 500 })
  }
}
