import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 退館処理
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; checkInId: string } }
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

    const body = await request.json();
    const { action } = body;

    if (action !== 'checkout') {
      return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });
    }

    // チェックインの存在確認
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        id: params.checkInId,
        storeId: params.id,
      },
    });

    if (!checkIn) {
      return NextResponse.json({ error: 'チェックイン記録が見つかりません' }, { status: 404 });
    }

    if (checkIn.checkedOutAt) {
      return NextResponse.json({ error: '既に退館処理済みです' }, { status: 400 });
    }

    // 退館処理
    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: params.checkInId },
      data: { checkedOutAt: new Date() },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberNumber: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCheckIn);
  } catch (error) {
    console.error('退館処理エラー:', error);
    return NextResponse.json({ error: '退館処理に失敗しました' }, { status: 500 });
  }
}
