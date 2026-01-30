import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 本番環境でのシードデータ投入用API
// セキュリティのため、SECRET_KEYが必要
export async function POST(request: Request) {
  try {
    const { secretKey } = await request.json()
    
    // シークレットキーの検証（環境変数またはデフォルト値）
    const validKey = process.env.SEED_SECRET_KEY || 'kickboxing-gym-seed-2024'
    if (secretKey !== validKey) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    // 既存データの確認
    const existingPlans = await prisma.plan.count()
    if (existingPlans > 0) {
      return NextResponse.json({ 
        message: '初期データは既に投入されています',
        plansCount: existingPlans 
      })
    }

    // プランを作成
    const plans = await Promise.all([
      prisma.plan.upsert({
        where: { id: 'plan_light' },
        update: {},
        create: {
          id: 'plan_light',
          name: 'ライトプラン',
          description: '週1回ペースで通いたい方に',
          price: 8800,
          sessionsPerMonth: 4,
          features: JSON.stringify(['月4回のパーソナルトレーニング', '更衣室・シャワー利用可', 'オリジナルタオル付き']),
          sortOrder: 1,
        },
      }),
      prisma.plan.upsert({
        where: { id: 'plan_standard' },
        update: {},
        create: {
          id: 'plan_standard',
          name: 'スタンダードプラン',
          description: '週2回でしっかりトレーニング',
          price: 15800,
          sessionsPerMonth: 8,
          features: JSON.stringify(['月8回のパーソナルトレーニング', '更衣室・シャワー利用可', 'グローブ無料レンタル', 'プロテイン1杯無料/回']),
          sortOrder: 2,
        },
      }),
      prisma.plan.upsert({
        where: { id: 'plan_premium' },
        update: {},
        create: {
          id: 'plan_premium',
          name: 'プレミアムプラン',
          description: '本格的に取り組みたい方に',
          price: 29800,
          sessionsPerMonth: 0, // 無制限
          features: JSON.stringify(['回数無制限パーソナルトレーニング', '更衣室・シャワー利用可', '全器具無料レンタル', 'プロテイン飲み放題', '優先予約', '体組成測定月1回無料']),
          sortOrder: 3,
        },
      }),
    ])

    // 管理者ユーザーを作成
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@trim-gym.jp' },
      update: {},
      create: {
        email: 'admin@trim-gym.jp',
        password: hashedPassword,
        role: 'owner',
      },
    })

    // トレーナーを作成
    const trainerPassword = await bcrypt.hash('trainer123', 12)
    const trainerUser = await prisma.user.upsert({
      where: { email: 'yamada@trim-gym.jp' },
      update: {},
      create: {
        email: 'yamada@trim-gym.jp',
        password: trainerPassword,
        role: 'trainer',
      },
    })

    const trainer = await prisma.trainer.upsert({
      where: { userId: trainerUser.id },
      update: {},
      create: {
        userId: trainerUser.id,
        firstName: '太郎',
        lastName: '山田',
        specialization: 'キックボクシング',
        bio: '元プロキックボクサー。10年以上の指導経験があります。初心者から上級者まで丁寧に指導します。',
        isActive: true,
      },
    })

    // トレーナーのスケジュールを作成
    for (let day = 1; day <= 6; day++) { // 月〜土
      for (let hour = 10; hour <= 20; hour++) {
        await prisma.schedule.create({
          data: {
            trainerId: trainer.id,
            dayOfWeek: day,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            maxCapacity: 1,
            isActive: true,
          },
        })
      }
    }

    // サンプル商品を作成
    await Promise.all([
      prisma.product.upsert({
        where: { id: 'product_gloves' },
        update: {},
        create: {
          id: 'product_gloves',
          name: 'オリジナルボクシンググローブ',
          description: '当ジムオリジナルの高品質グローブ。耐久性抜群。',
          price: 12800,
          category: 'gloves',
          stock: 20,
          isActive: true,
        },
      }),
      prisma.product.upsert({
        where: { id: 'product_wraps' },
        update: {},
        create: {
          id: 'product_wraps',
          name: 'バンテージ（2本組）',
          description: '手首を守る必需品。伸縮性のある素材で巻きやすい。',
          price: 1980,
          category: 'wraps',
          stock: 50,
          isActive: true,
        },
      }),
      prisma.product.upsert({
        where: { id: 'product_tshirt' },
        update: {},
        create: {
          id: 'product_tshirt',
          name: 'オリジナルTシャツ',
          description: '吸汗速乾素材のトレーニングTシャツ。',
          price: 3980,
          category: 'apparel',
          stock: 30,
          isActive: true,
        },
      }),
    ])

    // サンプルイベントを作成
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await prisma.event.upsert({
      where: { id: 'event_beginner' },
      update: {},
      create: {
        id: 'event_beginner',
        title: '初心者向けキックボクシング体験会',
        description: 'キックボクシングが初めての方向けの体験イベントです。基本的な構えやパンチ、キックの打ち方を学びます。',
        date: nextMonth,
        startTime: '14:00',
        endTime: '16:00',
        location: 'スタジオA',
        capacity: 10,
        price: 0,
        eventType: 'workshop',
        isPublished: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '初期データの投入が完了しました',
      data: {
        plans: plans.length,
        trainers: 1,
        products: 3,
        events: 1,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: '初期データの投入に失敗しました', details: String(error) },
      { status: 500 }
    )
  }
}

// GETでステータス確認
export async function GET() {
  try {
    const [plansCount, trainersCount, productsCount, eventsCount, usersCount] = await Promise.all([
      prisma.plan.count(),
      prisma.trainer.count(),
      prisma.product.count(),
      prisma.event.count(),
      prisma.user.count(),
    ])

    return NextResponse.json({
      initialized: plansCount > 0,
      counts: {
        plans: plansCount,
        trainers: trainersCount,
        products: productsCount,
        events: eventsCount,
        users: usersCount,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'データベース接続エラー', details: String(error) },
      { status: 500 }
    )
  }
}
