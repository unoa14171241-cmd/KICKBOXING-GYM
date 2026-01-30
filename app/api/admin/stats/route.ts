import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalMembers,
      activeMembers,
      todayReservations,
      todayCheckIns,
      newMembersThisMonth,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'active' } }),
      prisma.reservation.count({
        where: {
          date: { gte: today, lt: tomorrow },
          status: 'confirmed',
        },
      }),
      prisma.checkIn.count({
        where: {
          checkedInAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.member.count({
        where: {
          joinedAt: { gte: startOfMonth },
        },
      }),
    ])

    // 簡易的な月間売上計算（実際はプラン料金の集計が必要）
    const monthlyRevenue = activeMembers * 30000 // 仮の計算

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        todayReservations,
        todayCheckIns,
        monthlyRevenue,
        newMembersThisMonth,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    )
  }
}
