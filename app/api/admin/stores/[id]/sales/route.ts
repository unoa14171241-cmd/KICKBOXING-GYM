import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 売上実績一覧取得
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    // フィルター条件
    const where: {
      storeId: string;
      date?: { gte?: Date; lte?: Date };
      type?: string;
    } = { storeId: params.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type) {
      where.type = type;
    }

    const salesRecords = await prisma.salesRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    });

    // 集計データ
    const summary = await prisma.salesRecord.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const totalAmount = salesRecords.reduce((sum, record) => sum + record.amount, 0);

    return NextResponse.json({
      records: salesRecords,
      summary,
      totalAmount,
      count: salesRecords.length,
    });
  } catch (error) {
    console.error('売上実績取得エラー:', error);
    return NextResponse.json({ error: '売上実績の取得に失敗しました' }, { status: 500 });
  }
}

// 売上実績登録
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
    const { date, type, amount, description, referenceId } = body;

    if (!date || !type || amount === undefined) {
      return NextResponse.json({ error: '日付、種別、金額は必須です' }, { status: 400 });
    }

    // 店舗が存在するかチェック
    const store = await prisma.store.findUnique({
      where: { id: params.id },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const salesRecord = await prisma.salesRecord.create({
      data: {
        storeId: params.id,
        date: new Date(date),
        type,
        amount: parseInt(amount),
        description,
        referenceId,
        staffId: session.user.id,
      },
    });

    return NextResponse.json(salesRecord, { status: 201 });
  } catch (error) {
    console.error('売上実績登録エラー:', error);
    return NextResponse.json({ error: '売上実績の登録に失敗しました' }, { status: 500 });
  }
}

// 売上実績削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');

    if (!recordId) {
      return NextResponse.json({ error: '売上実績IDが必要です' }, { status: 400 });
    }

    // owner以外は所属店舗のみアクセス可能
    if (session.user.role !== 'owner') {
      const hasAccess = await prisma.storeStaff.findFirst({
        where: {
          userId: session.user.id,
          storeId: params.id,
          role: 'manager',
          isActive: true,
        },
      });

      if (!hasAccess) {
        return NextResponse.json({ error: '売上実績削除権限がありません' }, { status: 403 });
      }
    }

    await prisma.salesRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ message: '売上実績を削除しました' });
  } catch (error) {
    console.error('売上実績削除エラー:', error);
    return NextResponse.json({ error: '売上実績の削除に失敗しました' }, { status: 500 });
  }
}
