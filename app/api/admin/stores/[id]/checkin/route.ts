import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗のチェックイン状況取得
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

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 現在滞在中
    const currentlyIn = await prisma.checkIn.findMany({
      where: {
        storeId: params.id,
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
            phone: true,
            status: true,
            expiresAt: true,
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });

    // 本日の入退館履歴
    const todayHistory = await prisma.checkIn.findMany({
      where: {
        storeId: params.id,
        checkedInAt: { gte: today },
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            phone: true,
            status: true,
            expiresAt: true,
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });

    return NextResponse.json({
      store,
      currentlyIn,
      todayHistory,
    });
  } catch (error) {
    console.error('チェックイン状況取得エラー:', error);
    return NextResponse.json({ error: 'チェックイン状況の取得に失敗しました' }, { status: 500 });
  }
}

// チェックイン処理
export async function POST(
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

    const body = await request.json();
    const { memberId, method = 'manual' } = body;

    if (!memberId) {
      return NextResponse.json({ error: '会員IDが必要です' }, { status: 400 });
    }

    // 会員の存在確認
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: '会員が見つかりません' }, { status: 404 });
    }

    // 既にチェックイン中かチェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        memberId,
        storeId: params.id,
        checkedInAt: { gte: today },
        checkedOutAt: null,
      },
    });

    if (existingCheckIn) {
      return NextResponse.json({ error: 'この会員は既にチェックイン中です' }, { status: 400 });
    }

    // チェックイン作成
    const checkIn = await prisma.checkIn.create({
      data: {
        memberId,
        storeId: params.id,
        method,
      },
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

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('チェックインエラー:', error);
    return NextResponse.json({ error: 'チェックインに失敗しました' }, { status: 500 });
  }
}
