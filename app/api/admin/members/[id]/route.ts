import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 会員詳細取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'owner' && session.user.role !== 'trainer')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        plan: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: '会員が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      firstNameKana: member.firstNameKana,
      lastNameKana: member.lastNameKana,
      email: member.user.email,
      phone: member.phone,
      memberNumber: member.memberNumber,
      status: member.status,
      remainingSessions: member.remainingSessions,
      joinedAt: member.joinedAt,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      address: member.address,
      emergencyContact: member.emergencyContact,
      emergencyPhone: member.emergencyPhone,
      plan: member.plan,
    })
  } catch (error) {
    console.error('Member fetch error:', error)
    return NextResponse.json(
      { error: '会員情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 会員情報更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'owner' && session.user.role !== 'trainer')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      firstNameKana,
      lastNameKana,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      planId,
      status,
      remainingSessions,
    } = body

    // 会員の存在確認
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!existingMember) {
      return NextResponse.json({ error: '会員が見つかりません' }, { status: 404 })
    }

    // メールアドレスの重複チェック
    if (email !== existingMember.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })
      if (emailExists) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        )
      }
    }

    // トランザクションで更新
    await prisma.$transaction([
      // ユーザー情報（メール）の更新
      prisma.user.update({
        where: { id: existingMember.userId },
        data: { email },
      }),
      // 会員情報の更新
      prisma.member.update({
        where: { id: params.id },
        data: {
          firstName,
          lastName,
          firstNameKana,
          lastNameKana,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          address: address || null,
          emergencyContact: emergencyContact || null,
          emergencyPhone: emergencyPhone || null,
          planId: planId || null,
          status,
          remainingSessions: remainingSessions || 0,
        },
      }),
    ])

    return NextResponse.json({ success: true, message: '会員情報を更新しました' })
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json(
      { error: '会員情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 会員削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
    })

    if (!member) {
      return NextResponse.json({ error: '会員が見つかりません' }, { status: 404 })
    }

    // ユーザーを削除（Cascadeで会員も削除される）
    await prisma.user.delete({
      where: { id: member.userId },
    })

    return NextResponse.json({ success: true, message: '会員を削除しました' })
  } catch (error) {
    console.error('Member delete error:', error)
    return NextResponse.json(
      { error: '会員の削除に失敗しました' },
      { status: 500 }
    )
  }
}
