import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 店舗スタッフ一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager'].includes(session.user.role)) {
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

    const staff = await prisma.storeStaff.findMany({
      where: { storeId: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('店舗スタッフ一覧取得エラー:', error);
    return NextResponse.json({ error: 'スタッフ一覧の取得に失敗しました' }, { status: 500 });
  }
}

// 店舗スタッフ追加（新規ユーザー作成または既存ユーザー紐付け）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
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
        return NextResponse.json({ error: 'スタッフ追加権限がありません' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { email, password, role, userId, firstName, lastName } = body;

    // 店舗が存在するかチェック
    const store = await prisma.store.findUnique({
      where: { id: params.id },
    });

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    let targetUserId = userId;

    // 新規ユーザー作成の場合
    if (!userId && email && password) {
      // メールアドレスの重複チェック
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 400 });
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role === 'manager' ? 'store_manager' : 'staff',
        },
      });

      targetUserId = newUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'ユーザーID またはメール・パスワードが必要です' }, { status: 400 });
    }

    // 既に所属しているかチェック
    const existingStaff = await prisma.storeStaff.findUnique({
      where: {
        userId_storeId: {
          userId: targetUserId,
          storeId: params.id,
        },
      },
    });

    if (existingStaff) {
      return NextResponse.json({ error: 'このユーザーは既にこの店舗に所属しています' }, { status: 400 });
    }

    // スタッフ登録
    const storeStaff = await prisma.storeStaff.create({
      data: {
        userId: targetUserId,
        storeId: params.id,
        role: role || 'staff',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(storeStaff, { status: 201 });
  } catch (error) {
    console.error('店舗スタッフ追加エラー:', error);
    return NextResponse.json({ error: 'スタッフの追加に失敗しました' }, { status: 500 });
  }
}

// スタッフ削除
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
    const staffId = searchParams.get('staffId');

    if (!staffId) {
      return NextResponse.json({ error: 'スタッフIDが必要です' }, { status: 400 });
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
        return NextResponse.json({ error: 'スタッフ削除権限がありません' }, { status: 403 });
      }
    }

    await prisma.storeStaff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({ message: 'スタッフを削除しました' });
  } catch (error) {
    console.error('店舗スタッフ削除エラー:', error);
    return NextResponse.json({ error: 'スタッフの削除に失敗しました' }, { status: 500 });
  }
}
