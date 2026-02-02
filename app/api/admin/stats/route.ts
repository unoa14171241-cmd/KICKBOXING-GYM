import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['owner', 'trainer', 'store_manager', 'staff'].includes(session.user.role)) {
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

    // 店舗フィルター（owner以外は所属店舗のみ）
    let storeFilter = {}
    let accessibleStoreIds: string[] = []
    
    if (session.user.role !== 'owner') {
      const userStores = await prisma.storeStaff.findMany({
        where: { userId: session.user.id, isActive: true },
        select: { storeId: true },
      })
      accessibleStoreIds = userStores.map(s => s.storeId)
      storeFilter = { storeId: { in: accessibleStoreIds } }
    }

    const [
      totalMembers,
      activeMembers,
      todayReservations,
      todayCheckIns,
      newMembersThisMonth,
      totalStores,
      stores,
      monthSalesRecords,
    ] = await Promise.all([
      prisma.member.count({
        where: session.user.role === 'owner' ? {} : { storeId: { in: accessibleStoreIds } },
      }),
      prisma.member.count({ 
        where: { 
          status: 'active',
          ...(session.user.role !== 'owner' ? { storeId: { in: accessibleStoreIds } } : {}),
        } 
      }),
      prisma.reservation.count({
        where: {
          date: { gte: today, lt: tomorrow },
          status: 'confirmed',
        },
      }),
      prisma.checkIn.count({
        where: {
          checkedInAt: { gte: today, lt: tomorrow },
          ...(session.user.role !== 'owner' ? { storeId: { in: accessibleStoreIds } } : {}),
        },
      }),
      prisma.member.count({
        where: {
          joinedAt: { gte: startOfMonth },
          ...(session.user.role !== 'owner' ? { storeId: { in: accessibleStoreIds } } : {}),
        },
      }),
      prisma.store.count(),
      prisma.store.findMany({
        where: session.user.role === 'owner' ? {} : { id: { in: accessibleStoreIds } },
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: {
              members: true,
              trainers: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.salesRecord.aggregate({
        where: {
          date: { gte: startOfMonth },
          ...(session.user.role !== 'owner' ? { storeId: { in: accessibleStoreIds } } : {}),
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    // 月間売上は売上実績から計算
    const monthlyRevenue = monthSalesRecords._sum.amount || 0

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        todayReservations,
        todayCheckIns,
        monthlyRevenue,
        newMembersThisMonth,
        totalStores,
      },
      stores,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    )
  }
}
