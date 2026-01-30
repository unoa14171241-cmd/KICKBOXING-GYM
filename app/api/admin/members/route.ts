import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const members = await prisma.member.findMany({
      include: {
        user: {
          select: { email: true },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedMembers = members.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.user.email,
      phone: member.phone,
      memberNumber: member.memberNumber,
      status: member.status,
      remainingSessions: member.remainingSessions,
      joinedAt: member.joinedAt,
      plan: member.plan,
    }))

    return NextResponse.json({ members: formattedMembers })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: '会員情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}
