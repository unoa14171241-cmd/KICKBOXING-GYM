import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ trainers })
  } catch (error) {
    console.error('Error fetching trainers:', error)
    return NextResponse.json({ error: 'トレーナーの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, password, specialization, bio, isActive } = body

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'trainer',
        trainer: {
          create: {
            firstName,
            lastName,
            specialization,
            bio,
            isActive,
          },
        },
      },
      include: {
        trainer: true,
      },
    })

    return NextResponse.json({ trainer: user.trainer })
  } catch (error) {
    console.error('Error creating trainer:', error)
    return NextResponse.json({ error: 'トレーナーの作成に失敗しました' }, { status: 500 })
  }
}
