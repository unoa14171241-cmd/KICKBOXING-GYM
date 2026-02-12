import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const stores = await prisma.store.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                code: true,
            },
        })

        return NextResponse.json(stores)
    } catch (error) {
        console.error('Error fetching stores:', error)
        return NextResponse.json(
            { error: '店舗情報の取得に失敗しました' },
            { status: 500 }
        )
    }
}
