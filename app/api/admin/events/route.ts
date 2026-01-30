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

    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'イベントの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, date, startTime, endTime, location, capacity, price, eventType, isPublished } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        location,
        capacity,
        price,
        eventType,
        isPublished,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'イベントの作成に失敗しました' }, { status: 500 })
  }
}
