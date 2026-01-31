import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// TRIM GYMのプランデータ
const trimGymPlans = [
  {
    id: 'plan-fulltime',
    name: '一般フルタイム',
    description: '全ての時間帯で利用可能な一般会員向けプラン',
    price: 11000,
    sessionsPerMonth: 0, // 無制限
    features: JSON.stringify(['全時間帯利用可能', '全クラス参加OK', 'フリータイム利用可能']),
    sortOrder: 1,
  },
  {
    id: 'plan-student',
    name: '学生フルタイム',
    description: '中学生以上の学生向けプラン（学生証必要）',
    price: 8800,
    sessionsPerMonth: 0, // 無制限
    features: JSON.stringify(['全時間帯利用可能', '全クラス参加OK', 'フリータイム利用可能', '学生証必要']),
    sortOrder: 2,
  },
  {
    id: 'plan-monthly4',
    name: '月4回',
    description: '月4回までの利用が可能なプラン',
    price: 8800,
    sessionsPerMonth: 4,
    features: JSON.stringify(['月4回まで利用可能', '全クラス参加OK']),
    sortOrder: 3,
  },
  {
    id: 'plan-morning',
    name: '平日午前会員',
    description: '平日午前中のみ利用可能なお得なプラン',
    price: 6500,
    sessionsPerMonth: 0, // 無制限
    features: JSON.stringify(['平日午前のみ利用可能', '午前クラス参加OK']),
    sortOrder: 4,
  },
  {
    id: 'plan-kids',
    name: 'キッズ',
    description: '小学生以下のお子様向けプラン',
    price: 6500,
    sessionsPerMonth: 0, // 無制限
    features: JSON.stringify(['キッズクラス参加OK', '小学生以下対象']),
    sortOrder: 5,
  },
]

// 本番環境でのシードデータ投入用API
export async function POST(request: Request) {
  try {
    const { secretKey, force } = await request.json()
    
    // シークレットキーの検証（環境変数またはデフォルト値）
    const validKey = process.env.SEED_SECRET_KEY || 'kickboxing-gym-seed-2024'
    if (secretKey !== validKey) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    // forceオプションがある場合は既存データがあっても更新
    if (!force) {
      const existingPlans = await prisma.plan.count()
      if (existingPlans > 0) {
        return NextResponse.json({ 
          message: '初期データは既に投入されています。強制更新する場合は force: true を指定してください',
          plansCount: existingPlans 
        })
      }
    }

    // プランを作成/更新
    const plans = await Promise.all(
      trimGymPlans.map(plan => 
        prisma.plan.upsert({
          where: { id: plan.id },
          update: {
            name: plan.name,
            description: plan.description,
            price: plan.price,
            sessionsPerMonth: plan.sessionsPerMonth,
            features: plan.features,
            sortOrder: plan.sortOrder,
            isActive: true,
          },
          create: {
            ...plan,
            durationMonths: 1,
            isActive: true,
          },
        })
      )
    )

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
    
    const trainers = [
      { email: 'yamada@trim-gym.jp', firstName: '太郎', lastName: '山田', specialization: 'キックボクシング・ボクシング', bio: '元プロキックボクサー。10年以上の指導経験があります。' },
      { email: 'sato@trim-gym.jp', firstName: '花子', lastName: '佐藤', specialization: 'フィットネスキックボクシング', bio: '女性専門トレーナー。ダイエットやボディメイクを得意としています。' },
      { email: 'tanaka@trim-gym.jp', firstName: '健太', lastName: '田中', specialization: 'ムエタイ・総合格闘技', bio: 'ムエタイの本場タイで修行経験あり。' },
    ]

    for (const t of trainers) {
      const trainerUser = await prisma.user.upsert({
        where: { email: t.email },
        update: {},
        create: {
          email: t.email,
          password: trainerPassword,
          role: 'trainer',
        },
      })

      await prisma.trainer.upsert({
        where: { userId: trainerUser.id },
        update: {
          firstName: t.firstName,
          lastName: t.lastName,
          specialization: t.specialization,
          bio: t.bio,
        },
        create: {
          userId: trainerUser.id,
          firstName: t.firstName,
          lastName: t.lastName,
          specialization: t.specialization,
          bio: t.bio,
          isActive: true,
        },
      })
    }

    // サンプル商品を作成
    const products = [
      { id: 'product-gloves-1', name: 'TRIMオリジナルグローブ 14oz', description: 'トレーニング用高品質ボクシンググローブ', price: 12800, category: 'gloves', stock: 20 },
      { id: 'product-gloves-2', name: 'TRIMオリジナルグローブ 16oz', description: 'スパーリング用ボクシンググローブ', price: 14800, category: 'gloves', stock: 15 },
      { id: 'product-wraps-1', name: 'バンテージ 4.5m', description: '伸縮性のある練習用バンテージ', price: 1500, category: 'wraps', stock: 50 },
      { id: 'product-glove-military', name: '軍手', description: 'レンタルグローブ使用時に必要', price: 100, category: 'accessories', stock: 100 },
      { id: 'product-apparel-1', name: 'TRIMドライTシャツ', description: '吸汗速乾素材のトレーニングTシャツ', price: 4500, category: 'apparel', stock: 30 },
    ]

    for (const p of products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: { name: p.name, description: p.description, price: p.price, stock: p.stock },
        create: { ...p, isActive: true },
      })
    }

    // サンプルイベントを作成
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await prisma.event.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        title: 'キックボクシング入門セミナー',
        description: '初心者向けのキックボクシング基礎セミナーです。',
        date: nextMonth,
        startTime: '14:00',
        endTime: '16:00',
        location: 'TRIM GYM メインスタジオ',
        capacity: 20,
        price: 0,
        eventType: 'seminar',
        isPublished: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'TRIM GYMデータの投入が完了しました',
      data: {
        plans: plans.length,
        trainers: trainers.length,
        products: products.length,
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

// GETでステータス確認 & 簡易シード実行
export async function GET() {
  try {
    const [plansCount, trainersCount, productsCount, eventsCount, usersCount] = await Promise.all([
      prisma.plan.count(),
      prisma.trainer.count(),
      prisma.product.count(),
      prisma.event.count(),
      prisma.user.count(),
    ])

    // プランがない場合は自動でシード
    if (plansCount === 0) {
      // プランを作成
      await Promise.all(
        trimGymPlans.map(plan => 
          prisma.plan.upsert({
            where: { id: plan.id },
            update: {},
            create: {
              ...plan,
              durationMonths: 1,
              isActive: true,
            },
          })
        )
      )

      // 管理者を作成
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.upsert({
        where: { email: 'admin@trim-gym.jp' },
        update: {},
        create: {
          email: 'admin@trim-gym.jp',
          password: hashedPassword,
          role: 'owner',
        },
      })

      return NextResponse.json({
        initialized: true,
        message: '初期データを自動投入しました',
        counts: {
          plans: trimGymPlans.length,
          trainers: 0,
          products: 0,
          events: 0,
          users: 1,
        },
      })
    }

    // プランリストも返す
    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, price: true, sessionsPerMonth: true },
    })

    return NextResponse.json({
      initialized: plansCount > 0,
      counts: {
        plans: plansCount,
        trainers: trainersCount,
        products: productsCount,
        events: eventsCount,
        users: usersCount,
      },
      plans,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'データベース接続エラー', details: String(error) },
      { status: 500 }
    )
  }
}
