import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            trainers: true,
            checkIns: true,
            orders: true,
            events: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
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

    return NextResponse.json(store);
  } catch (error) {
    console.error('店舗詳細取得エラー:', error);
    return NextResponse.json({ error: '店舗詳細の取得に失敗しました' }, { status: 500 });
  }
}

// 店舗更新（ownerまたは店舗管理者）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // owner以外は所属店舗のみ更新可能
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
        return NextResponse.json({ error: 'この店舗の更新権限がありません' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, code, address, postalCode, phone, email, imageUrl, isActive } = body;

    // コードの重複チェック（自身以外）
    if (code) {
      const existingStore = await prisma.store.findFirst({
        where: {
          code,
          NOT: { id: params.id },
        },
      });

      if (existingStore) {
        return NextResponse.json({ error: 'この店舗コードは既に使用されています' }, { status: 400 });
      }
    }

    const store = await prisma.store.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address && { address }),
        ...(postalCode !== undefined && { postalCode }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('店舗更新エラー:', error);
    return NextResponse.json({ error: '店舗の更新に失敗しました' }, { status: 500 });
  }
}

// 店舗削除（ownerのみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // 店舗に紐づくデータがあるかチェック
    const store = await prisma.store.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true,
            trainers: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    if (store._count.members > 0 || store._count.trainers > 0) {
      return NextResponse.json({ 
        error: 'この店舗には会員またはトレーナーが所属しているため削除できません' 
      }, { status: 400 });
    }

    await prisma.store.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '店舗を削除しました' });
  } catch (error) {
    console.error('店舗削除エラー:', error);
    return NextResponse.json({ error: '店舗の削除に失敗しました' }, { status: 500 });
  }
}
