import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 店舗会員検索
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
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    // 会員番号、名前、電話番号で検索
    const members = await prisma.member.findMany({
      where: {
        storeId: params.id,
        OR: [
          { memberNumber: { contains: query } },
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { firstNameKana: { contains: query } },
          { lastNameKana: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        memberNumber: true,
        phone: true,
        status: true,
        expiresAt: true,
        plan: {
          select: { name: true },
        },
      },
      take: 10,
      orderBy: { lastName: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('会員検索エラー:', error);
    return NextResponse.json({ error: '検索に失敗しました' }, { status: 500 });
  }
}
