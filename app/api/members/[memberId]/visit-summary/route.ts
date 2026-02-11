import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 来店サマリー（回数・最終来店日）取得
export async function GET(
    request: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const count = await prisma.checkIn.count({
            where: { memberId: params.memberId },
        });

        const lastVisit = await prisma.checkIn.findFirst({
            where: { memberId: params.memberId },
            orderBy: { checkedInAt: 'desc' },
        });

        return NextResponse.json({
            count,
            lastVisitDate: lastVisit?.checkedInAt || null,
        });
    } catch (error) {
        console.error('Error fetching visit summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch summary' },
            { status: 500 }
        );
    }
}
