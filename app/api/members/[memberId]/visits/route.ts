import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 来店履歴取得
export async function GET(
    request: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        // URLパラメータからlimitを取得（デフォルト50）
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const visits = await prisma.checkIn.findMany({
            where: { memberId: params.memberId },
            orderBy: { checkedInAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch visits' },
            { status: 500 }
        );
    }
}

// POST: 来店記録の手動追加
export async function POST(
    request: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const body = await request.json();
        const { visitedAt, memo } = body;

        // memberIdの存在確認
        const member = await prisma.member.findUnique({
            where: { id: params.memberId },
        });

        if (!member) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        const visit = await prisma.checkIn.create({
            data: {
                memberId: params.memberId,
                checkedInAt: visitedAt ? new Date(visitedAt) : new Date(),
                method: 'manual', // 手動追加
                notes: memo,
            },
        });

        return NextResponse.json(visit);
    } catch (error) {
        console.error('Error creating visit:', error);
        return NextResponse.json(
            { error: 'Failed to create visit' },
            { status: 500 }
        );
    }
}
