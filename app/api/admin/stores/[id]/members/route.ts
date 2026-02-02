import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗の会員一覧取得
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

    const members = await prisma.member.findMany({
      where: { storeId: params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        _count: {
          select: {
            checkIns: true,
            reservations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('店舗会員一覧取得エラー:', error);
    return NextResponse.json({ error: '会員一覧の取得に失敗しました' }, { status: 500 });
  }
}
