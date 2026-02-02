import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 店舗マネージャーまたはオーナーのみアクセス可能
    if (!['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // クエリパラメータから店舗IDを取得（オーナーの場合）
    const { searchParams } = new URL(request.url);
    const requestedStoreId = searchParams.get('storeId');

    // アクセス可能な店舗を取得
    let accessibleStoreIds: string[] = [];
    
    if (session.user.role === 'owner') {
      // オーナーは全店舗アクセス可能
      const allStores = await prisma.store.findMany({ select: { id: true } });
      accessibleStoreIds = allStores.map(s => s.id);
    } else {
      // 店舗マネージャー/スタッフは所属店舗のみ
      const userStores = await prisma.storeStaff.findMany({
        where: { userId: session.user.id, isActive: true },
        select: { storeId: true },
      });
      accessibleStoreIds = userStores.map(s => s.storeId);
    }

    if (accessibleStoreIds.length === 0) {
      return NextResponse.json({ error: '所属店舗がありません' }, { status: 403 });
    }

    // 対象店舗を決定
    const targetStoreId = requestedStoreId && accessibleStoreIds.includes(requestedStoreId)
      ? requestedStoreId
      : accessibleStoreIds[0];

    // 店舗情報を取得
    const store = await prisma.store.findUnique({
      where: { id: targetStoreId },
      select: { id: true, name: true, code: true },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    // 日付設定
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    // 並列でデータ取得
    const [
      // 今日の予約
      todayReservations,
      // 本日のチェックイン数
      todayCheckInsCount,
      // 現在チェックイン中（退館していない）
      currentlyCheckedIn,
      // 期限切れ間近の会員（30日以内）
      expiringMembers,
      // 直近のキャンセル（1週間以内）
      recentCancellations,
      // 店舗の会員数
      totalMembers,
      activeMembers,
      // 今月の売上
      monthSales,
      // 今月の新規会員
      newMembersThisMonth,
      // アクセス可能な全店舗リスト
      accessibleStores,
    ] = await Promise.all([
      // 今日の予約一覧
      prisma.reservation.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
          trainer: { storeId: targetStoreId },
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
              expiresAt: true,
            },
          },
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      }),

      // 本日のチェックイン数
      prisma.checkIn.count({
        where: {
          storeId: targetStoreId,
          checkedInAt: { gte: today, lt: tomorrow },
        },
      }),

      // 現在チェックイン中
      prisma.checkIn.findMany({
        where: {
          storeId: targetStoreId,
          checkedInAt: { gte: today },
          checkedOutAt: null,
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              memberNumber: true,
              status: true,
              expiresAt: true,
              plan: { select: { name: true } },
            },
          },
        },
        orderBy: { checkedInAt: 'desc' },
      }),

      // 期限切れ間近の会員
      prisma.member.findMany({
        where: {
          storeId: targetStoreId,
          status: 'active',
          expiresAt: {
            gte: today,
            lte: thirtyDaysLater,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberNumber: true,
          expiresAt: true,
          plan: { select: { name: true } },
        },
        orderBy: { expiresAt: 'asc' },
        take: 10,
      }),

      // 直近のキャンセル
      prisma.reservation.findMany({
        where: {
          trainer: { storeId: targetStoreId },
          status: { in: ['cancelled', 'no_show'] },
          updatedAt: { gte: weekAgo },
        },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          trainer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),

      // 総会員数
      prisma.member.count({
        where: { storeId: targetStoreId },
      }),

      // アクティブ会員数
      prisma.member.count({
        where: { storeId: targetStoreId, status: 'active' },
      }),

      // 今月の売上
      prisma.salesRecord.aggregate({
        where: {
          storeId: targetStoreId,
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // 今月の新規会員
      prisma.member.count({
        where: {
          storeId: targetStoreId,
          joinedAt: { gte: startOfMonth },
        },
      }),

      // アクセス可能な店舗リスト
      prisma.store.findMany({
        where: { id: { in: accessibleStoreIds } },
        select: { id: true, name: true, code: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // 滞在時間を計算
    const checkedInWithDuration = currentlyCheckedIn.map(ci => {
      const duration = Math.floor((Date.now() - new Date(ci.checkedInAt).getTime()) / 60000);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return {
        ...ci,
        duration,
        durationText: hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`,
        // アラート条件
        alerts: {
          expired: ci.member.expiresAt && new Date(ci.member.expiresAt) < today,
          suspended: ci.member.status !== 'active',
          longStay: duration > 180, // 3時間以上
        },
      };
    });

    return NextResponse.json({
      store,
      accessibleStores,
      stats: {
        todayReservations: todayReservations.length,
        todayCheckIns: todayCheckInsCount,
        currentlyCheckedIn: currentlyCheckedIn.length,
        totalMembers,
        activeMembers,
        monthSales: monthSales._sum.amount || 0,
        newMembersThisMonth,
        expiringMembersCount: expiringMembers.length,
        recentCancellationsCount: recentCancellations.length,
      },
      todayReservations: todayReservations.map(r => ({
        id: r.id,
        time: r.startTime,
        endTime: r.endTime,
        status: r.status,
        member: {
          id: r.member.id,
          name: `${r.member.lastName} ${r.member.firstName}`,
          phone: r.member.phone,
          status: r.member.status,
          hasAlert: r.member.status !== 'active' || 
            (r.member.expiresAt && new Date(r.member.expiresAt) < today),
        },
        trainer: {
          id: r.trainer.id,
          name: `${r.trainer.lastName} ${r.trainer.firstName}`,
        },
      })),
      currentlyCheckedIn: checkedInWithDuration,
      expiringMembers,
      recentCancellations: recentCancellations.map(r => ({
        id: r.id,
        date: r.date,
        status: r.status,
        memberName: `${r.member.lastName} ${r.member.firstName}`,
        trainerName: `${r.trainer.lastName} ${r.trainer.firstName}`,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error) {
    console.error('店舗ダッシュボードエラー:', error);
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
