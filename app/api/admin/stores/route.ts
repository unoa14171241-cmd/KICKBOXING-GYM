import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'store_manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ownerは全店舗、それ以外は所属店舗のみ
    let stores;
    if (session.user.role === 'owner') {
      stores = await prisma.store.findMany({
        include: {
          _count: {
            select: {
              members: true,
              trainers: true,
              staff: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      const storeStaff = await prisma.storeStaff.findMany({
        where: { userId: session.user.id, isActive: true },
        include: {
          store: {
            include: {
              _count: {
                select: {
                  members: true,
                  trainers: true,
                  staff: true,
                },
              },
            },
          },
        },
      });
      stores = storeStaff.map((s) => s.store);
    }

    return NextResponse.json(stores);
  } catch (error) {
    console.error('店舗一覧取得エラー:', error);
    return NextResponse.json({ error: '店舗一覧の取得に失敗しました' }, { status: 500 });
  }
}

// 店舗作成（ownerのみ）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, address, postalCode, phone, email, imageUrl } = body;

    if (!name || !code || !address) {
      return NextResponse.json({ error: '店舗名、コード、住所は必須です' }, { status: 400 });
    }

    // コードの重複チェック
    const existingStore = await prisma.store.findUnique({
      where: { code },
    });

    if (existingStore) {
      return NextResponse.json({ error: 'この店舗コードは既に使用されています' }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        code,
        address,
        postalCode,
        phone,
        email,
        imageUrl,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('店舗作成エラー:', error);
    return NextResponse.json({ error: '店舗の作成に失敗しました' }, { status: 500 });
  }
}
