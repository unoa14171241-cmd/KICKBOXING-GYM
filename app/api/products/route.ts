import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = { isActive: true }
    if (category) {
      where.category = category
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: '商品の取得に失敗しました' },
      { status: 500 }
    )
  }
}
