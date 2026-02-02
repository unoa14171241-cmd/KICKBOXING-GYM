import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 予約ステータス更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reservationId: string } }
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
    const { status, notes } = body;

    // 予約の存在確認（店舗のトレーナーに紐づくもののみ）
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: params.reservationId,
        trainer: { storeId: params.id },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
    }

    // 予約更新
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberNumber: true,
          },
        },
        trainer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('予約更新エラー:', error);
    return NextResponse.json({ error: '予約の更新に失敗しました' }, { status: 500 });
  }
}
