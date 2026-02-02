import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗の予約一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // owner以外は所属店舗のみアクセス可能
    if (session.user.role !== 'owner') {
      const hasAccess = await prisma.storeStaff.findFirst({
        where: {
          userId: session.user.id,
          storeId: params.id,
          isActive: true,
        },
      });

      if (!hasAccess) {
        return NextResponse.json({ error: 'この店舗へのアクセス権限がありません' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    // 日付フィルタ
    let dateFilter = {};
    if (dateStr) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = {
        date: {
          gte: date,
          lt: nextDay,
        },
      };
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        trainer: { storeId: params.id },
        ...dateFilter,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            phone: true,
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
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('予約一覧取得エラー:', error);
    return NextResponse.json({ error: '予約一覧の取得に失敗しました' }, { status: 500 });
  }
}
