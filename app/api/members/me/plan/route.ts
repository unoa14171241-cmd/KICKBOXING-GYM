import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// プラン購入・変更申請
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'プランIDが必要です' },
        { status: 400 }
      )
    }

    // プランの存在確認
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      )
    }

    // 会員情報を取得
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: '会員情報が見つかりません' },
        { status: 404 }
      )
    }

    // プランを更新（回数券の場合はセッション数を加算）
    let updateData: any = {
      planId: plan.id,
    }

    // 回数券またはパーソナルプランの場合、セッション数を加算
    const features = JSON.parse(plan.features || '{}')
    if (features.category === 'ticket' || (features.category === 'personal' && plan.sessionsPerMonth > 0)) {
      updateData.remainingSessions = {
        increment: plan.sessionsPerMonth,
      }
    } else if (features.category === 'membership') {
      // 月額会員の場合は、セッション数をリセット
      updateData.remainingSessions = plan.sessionsPerMonth
    }

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: updateData,
      include: {
        plan: true,
      },
    })

    return NextResponse.json({
      id: updatedMember.id,
      planId: updatedMember.planId,
      plan: updatedMember.plan ? {
        id: updatedMember.plan.id,
        name: updatedMember.plan.name,
        price: updatedMember.plan.price,
      } : null,
      remainingSessions: updatedMember.remainingSessions,
    })
  } catch (error) {
    console.error('Plan purchase error:', error)
    return NextResponse.json(
      { error: 'プランの購入に失敗しました' },
      { status: 500 }
    )
  }
}
