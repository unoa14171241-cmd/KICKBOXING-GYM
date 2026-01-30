import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, sessionsPerMonth, durationMonths, isActive, sortOrder } = body

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        sessionsPerMonth,
        durationMonths,
        isActive,
        sortOrder,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ error: 'プランの更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // プランを使用中の会員がいるかチェック
    const membersUsingPlan = await prisma.member.count({
      where: { planId: params.id },
    })

    if (membersUsingPlan > 0) {
      return NextResponse.json(
        { error: `このプランは${membersUsingPlan}名の会員が利用中のため削除できません` },
        { status: 400 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json({ error: 'プランの削除に失敗しました' }, { status: 500 })
  }
}
