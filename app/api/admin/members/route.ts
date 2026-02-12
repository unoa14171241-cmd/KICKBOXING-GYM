import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateMemberNumber, generateQRCode } from '@/lib/utils'

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
        store: true,
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
      store: member.store ? {
        id: member.store.id,
        name: member.store.name,
      } : null,
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

// 管理者による新規会員登録
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      firstNameKana,
      lastNameKana,
      phone,
      dateOfBirth,
      gender,
      planId,
    } = body

    // バリデーション
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // 会員番号とQRコードを生成
    const memberNumber = generateMemberNumber()
    const qrCode = generateQRCode()

    // プランの情報を取得（選択された場合）
    let remainingSessions = 0
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } })
      if (plan) {
        remainingSessions = plan.sessionsPerMonth
      }
    }

    // ユーザーと会員を作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'member',
        member: {
          create: {
            firstName,
            lastName,
            firstNameKana: firstNameKana || '',
            lastNameKana: lastNameKana || '',
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            memberNumber,
            qrCode,
            planId: planId || null,
            remainingSessions,
            status: 'active',
          },
        },
      },
      include: {
        member: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '会員を登録しました',
      member: {
        id: user.member?.id,
        email: user.email,
        firstName,
        lastName,
        memberNumber,
      },
    })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: '会員登録に失敗しました' },
      { status: 500 }
    )
  }
}
