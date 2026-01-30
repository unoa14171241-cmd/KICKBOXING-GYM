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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { error: 'このイベントは定員に達しています' },
        { status: 400 }
      )
    }

    // 既に登録済みかチェック
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_memberId: {
          eventId: params.id,
          memberId: member.id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: '既にこのイベントに登録済みです' },
        { status: 400 }
      )
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: params.id,
        memberId: member.id,
        status: 'registered',
      },
    })

    return NextResponse.json({ registration })
  } catch (error) {
    console.error('Error registering for event:', error)
    return NextResponse.json(
      { error: 'イベント登録に失敗しました' },
      { status: 500 }
    )
  }
}
