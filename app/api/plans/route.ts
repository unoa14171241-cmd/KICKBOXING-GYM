import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // membership, personal, ticket, all

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // カテゴリでフィルタリング
    const filteredPlans = plans.filter(plan => {
      if (!category || category === 'all') return true
      
      try {
        const features = JSON.parse(plan.features || '{}')
        return features.category === category
      } catch {
        return false
      }
    })

    // フロントエンド用にフォーマット
    const formattedPlans = filteredPlans.map(plan => {
      let parsedFeatures = { category: 'membership', items: [] as string[] }
      try {
        parsedFeatures = JSON.parse(plan.features || '{}')
      } catch {}

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        sessionsPerMonth: plan.sessionsPerMonth,
        durationMonths: plan.durationMonths,
        category: parsedFeatures.category || 'membership',
        features: parsedFeatures.items || [],
        duration: parsedFeatures.duration,
        type: parsedFeatures.type,
        validity: parsedFeatures.validity,
        sortOrder: plan.sortOrder,
      }
    })

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Plans fetch error:', error)
    return NextResponse.json(
      { error: 'プランの取得に失敗しました' },
      { status: 500 }
    )
  }
}
