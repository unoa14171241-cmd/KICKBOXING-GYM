import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// TRIM GYMの店舗データ
const stores = [
  {
    id: 'store-tsukuba',
    name: 'TRIMGYM つくば',
    code: 'tsukuba',
    address: '茨城県つくば市竹園2-11-15 柏ファミリープラザテナント１号',
    postalCode: '305-0032',
    phone: '',
    email: 'tsukuba@trim-gym.jp',
    isActive: true,
  },
  {
    id: 'store-moriya',
    name: 'TRIMGYM 守谷',
    code: 'moriya',
    address: '茨城県つくばみらい市絹の台3-26-4',
    postalCode: '300-2436',
    phone: '',
    email: 'moriya@trim-gym.jp',
    isActive: true,
  },
]

// TRIM GYMの通常会員プラン
const membershipPlans = [
  {
    id: 'plan-fulltime',
    name: '一般フルタイム',
    description: '全ての時間帯で利用可能な一般会員向けプラン',
    price: 11000,
    sessionsPerMonth: 0, // 無制限
    durationMonths: 1,
    features: JSON.stringify({
      category: 'membership',
      items: ['全時間帯利用可能', '全クラス参加OK', 'フリータイム利用可能']
    }),
    sortOrder: 1,
  },
  {
    id: 'plan-student',
    name: '学生フルタイム',
    description: '中学生以上の学生向けプラン（学生証必要）',
    price: 8800,
    sessionsPerMonth: 0,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'membership',
      items: ['全時間帯利用可能', '全クラス参加OK', 'フリータイム利用可能', '学生証必要']
    }),
    sortOrder: 2,
  },
  {
    id: 'plan-monthly4',
    name: '月4回',
    description: '月4回までの利用が可能なプラン',
    price: 8800,
    sessionsPerMonth: 4,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'membership',
      items: ['月4回まで利用可能', '全クラス参加OK']
    }),
    sortOrder: 3,
  },
  {
    id: 'plan-morning',
    name: '平日午前会員',
    description: '平日午前中のみ利用可能なお得なプラン',
    price: 6500,
    sessionsPerMonth: 0,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'membership',
      items: ['平日午前のみ利用可能', '午前クラス参加OK']
    }),
    sortOrder: 4,
  },
  {
    id: 'plan-kids',
    name: 'キッズ',
    description: '小学生以下のお子様向けプラン',
    price: 6500,
    sessionsPerMonth: 0,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'membership',
      items: ['キッズクラス参加OK', '小学生以下対象']
    }),
    sortOrder: 5,
  },
]

// パーソナルレッスンプラン（30分コース）
const personal30minPlans = [
  {
    id: 'plan-personal-30-4',
    name: 'パーソナル30分 月4回',
    description: '30分パーソナルレッスン 月4回コース',
    price: 16000,
    sessionsPerMonth: 4,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'personal',
      duration: 30,
      type: 'monthly',
      items: ['30分パーソナルレッスン', '月4回', 'トレーナー指名可能']
    }),
    sortOrder: 11,
  },
  {
    id: 'plan-personal-30-6',
    name: 'パーソナル30分 月6回',
    description: '30分パーソナルレッスン 月6回コース',
    price: 21000,
    sessionsPerMonth: 6,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'personal',
      duration: 30,
      type: 'monthly',
      items: ['30分パーソナルレッスン', '月6回', 'トレーナー指名可能']
    }),
    sortOrder: 12,
  },
]

// パーソナルレッスンプラン（60分コース）
const personal60minPlans = [
  {
    id: 'plan-personal-60-4',
    name: 'パーソナル60分 月4回',
    description: '60分パーソナルレッスン 月4回コース',
    price: 22000,
    sessionsPerMonth: 4,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'personal',
      duration: 60,
      type: 'monthly',
      items: ['60分パーソナルレッスン', '月4回', 'トレーナー指名可能']
    }),
    sortOrder: 21,
  },
  {
    id: 'plan-personal-60-6',
    name: 'パーソナル60分 月6回',
    description: '60分パーソナルレッスン 月6回コース',
    price: 30000,
    sessionsPerMonth: 6,
    durationMonths: 1,
    features: JSON.stringify({
      category: 'personal',
      duration: 60,
      type: 'monthly',
      items: ['60分パーソナルレッスン', '月6回', 'トレーナー指名可能']
    }),
    sortOrder: 22,
  },
]

// 回数券プラン（30分）
const ticket30minPlans = [
  {
    id: 'plan-ticket-30-3',
    name: '30分回数券 3回',
    description: '30分パーソナルレッスン 3回券（有効期限3ヶ月）',
    price: 13500,
    sessionsPerMonth: 3,
    durationMonths: 3,
    features: JSON.stringify({
      category: 'ticket',
      duration: 30,
      type: 'ticket',
      validity: '3ヶ月',
      items: ['30分パーソナルレッスン', '3回分', '有効期限3ヶ月']
    }),
    sortOrder: 31,
  },
  {
    id: 'plan-ticket-30-5',
    name: '30分回数券 5回',
    description: '30分パーソナルレッスン 5回券（有効期限6ヶ月）',
    price: 21000,
    sessionsPerMonth: 5,
    durationMonths: 6,
    features: JSON.stringify({
      category: 'ticket',
      duration: 30,
      type: 'ticket',
      validity: '6ヶ月',
      items: ['30分パーソナルレッスン', '5回分', '有効期限6ヶ月']
    }),
    sortOrder: 32,
  },
  {
    id: 'plan-ticket-30-10',
    name: '30分回数券 10回',
    description: '30分パーソナルレッスン 10回券（有効期限12ヶ月）',
    price: 40000,
    sessionsPerMonth: 10,
    durationMonths: 12,
    features: JSON.stringify({
      category: 'ticket',
      duration: 30,
      type: 'ticket',
      validity: '12ヶ月',
      items: ['30分パーソナルレッスン', '10回分', '有効期限12ヶ月']
    }),
    sortOrder: 33,
  },
]

// 回数券プラン（60分）
const ticket60minPlans = [
  {
    id: 'plan-ticket-60-3',
    name: '60分回数券 3回',
    description: '60分パーソナルレッスン 3回券（有効期限3ヶ月）',
    price: 18000,
    sessionsPerMonth: 3,
    durationMonths: 3,
    features: JSON.stringify({
      category: 'ticket',
      duration: 60,
      type: 'ticket',
      validity: '3ヶ月',
      items: ['60分パーソナルレッスン', '3回分', '有効期限3ヶ月']
    }),
    sortOrder: 41,
  },
  {
    id: 'plan-ticket-60-5',
    name: '60分回数券 5回',
    description: '60分パーソナルレッスン 5回券（有効期限6ヶ月）',
    price: 28500,
    sessionsPerMonth: 5,
    durationMonths: 6,
    features: JSON.stringify({
      category: 'ticket',
      duration: 60,
      type: 'ticket',
      validity: '6ヶ月',
      items: ['60分パーソナルレッスン', '5回分', '有効期限6ヶ月']
    }),
    sortOrder: 42,
  },
  {
    id: 'plan-ticket-60-10',
    name: '60分回数券 10回',
    description: '60分パーソナルレッスン 10回券（有効期限12ヶ月）',
    price: 54000,
    sessionsPerMonth: 10,
    durationMonths: 12,
    features: JSON.stringify({
      category: 'ticket',
      duration: 60,
      type: 'ticket',
      validity: '12ヶ月',
      items: ['60分パーソナルレッスン', '10回分', '有効期限12ヶ月']
    }),
    sortOrder: 43,
  },
]

// 全プランを結合
const allPlans = [
  ...membershipPlans,
  ...personal30minPlans,
  ...personal60minPlans,
  ...ticket30minPlans,
  ...ticket60minPlans,
]

// 本番環境でのシードデータ投入用API
export async function POST(request: Request) {
  try {
    const { secretKey, force } = await request.json()
    
    const validKey = process.env.SEED_SECRET_KEY || 'kickboxing-gym-seed-2024'
    if (secretKey !== validKey) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

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
      allPlans.map(plan => 
        prisma.plan.upsert({
          where: { id: plan.id },
          update: {
            name: plan.name,
            description: plan.description,
            price: plan.price,
            sessionsPerMonth: plan.sessionsPerMonth,
            durationMonths: plan.durationMonths || 1,
            features: plan.features,
            sortOrder: plan.sortOrder,
            isActive: true,
          },
          create: {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            sessionsPerMonth: plan.sessionsPerMonth,
            durationMonths: plan.durationMonths || 1,
            features: plan.features,
            sortOrder: plan.sortOrder,
            isActive: true,
          },
        })
      )
    )

    // 店舗を作成
    const createdStores = await Promise.all(
      stores.map(store =>
        prisma.store.upsert({
          where: { id: store.id },
          update: {
            name: store.name,
            address: store.address,
            postalCode: store.postalCode,
            phone: store.phone,
            email: store.email,
            isActive: store.isActive,
          },
          create: {
            id: store.id,
            name: store.name,
            code: store.code,
            address: store.address,
            postalCode: store.postalCode,
            phone: store.phone,
            email: store.email,
            isActive: store.isActive,
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

    // トレーナーを作成（店舗に紐付け）
    const trainerPassword = await bcrypt.hash('trainer123', 12)
    
    const trainers = [
      { email: 'yamada@trim-gym.jp', firstName: '太郎', lastName: '山田', specialization: 'キックボクシング・ボクシング', bio: '元プロキックボクサー。10年以上の指導経験があります。', storeId: 'store-tsukuba' },
      { email: 'sato@trim-gym.jp', firstName: '花子', lastName: '佐藤', specialization: 'フィットネスキックボクシング', bio: '女性専門トレーナー。ダイエットやボディメイクを得意としています。', storeId: 'store-tsukuba' },
      { email: 'tanaka@trim-gym.jp', firstName: '健太', lastName: '田中', specialization: 'ムエタイ・総合格闘技', bio: 'ムエタイの本場タイで修行経験あり。', storeId: 'store-moriya' },
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
          storeId: t.storeId,
        },
        create: {
          userId: trainerUser.id,
          firstName: t.firstName,
          lastName: t.lastName,
          specialization: t.specialization,
          bio: t.bio,
          storeId: t.storeId,
          isActive: true,
        },
      })
    }

    // 店舗スタッフ（店舗管理者）を作成
    const storeManagerPassword = await bcrypt.hash('manager123', 12)
    
    // つくば店の店舗管理者
    const tsukubaManager = await prisma.user.upsert({
      where: { email: 'manager-tsukuba@trim-gym.jp' },
      update: {},
      create: {
        email: 'manager-tsukuba@trim-gym.jp',
        password: storeManagerPassword,
        role: 'store_manager',
      },
    })
    await prisma.storeStaff.upsert({
      where: { userId_storeId: { userId: tsukubaManager.id, storeId: 'store-tsukuba' } },
      update: { role: 'manager', isActive: true },
      create: { userId: tsukubaManager.id, storeId: 'store-tsukuba', role: 'manager', isActive: true },
    })

    // 守谷店の店舗管理者
    const moriyaManager = await prisma.user.upsert({
      where: { email: 'manager-moriya@trim-gym.jp' },
      update: {},
      create: {
        email: 'manager-moriya@trim-gym.jp',
        password: storeManagerPassword,
        role: 'store_manager',
      },
    })
    await prisma.storeStaff.upsert({
      where: { userId_storeId: { userId: moriyaManager.id, storeId: 'store-moriya' } },
      update: { role: 'manager', isActive: true },
      create: { userId: moriyaManager.id, storeId: 'store-moriya', role: 'manager', isActive: true },
    })

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

    return NextResponse.json({
      success: true,
      message: 'TRIM GYMデータの投入が完了しました',
      data: {
        stores: stores.length,
        plans: plans.length,
        membershipPlans: membershipPlans.length,
        personalPlans: personal30minPlans.length + personal60minPlans.length,
        ticketPlans: ticket30minPlans.length + ticket60minPlans.length,
        trainers: trainers.length,
        products: products.length,
        storeManagers: 2,
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

// GETでステータス確認 & プランがない場合は自動シード
export async function GET() {
  try {
    const [plansCount, trainersCount, productsCount, eventsCount, usersCount, storesCount] = await Promise.all([
      prisma.plan.count(),
      prisma.trainer.count(),
      prisma.product.count(),
      prisma.event.count(),
      prisma.user.count(),
      prisma.store.count(),
    ])

    // プランがない場合は自動でシード
    if (plansCount === 0) {
      // 店舗を作成
      await Promise.all(
        stores.map(store =>
          prisma.store.upsert({
            where: { id: store.id },
            update: {},
            create: {
              id: store.id,
              name: store.name,
              code: store.code,
              address: store.address,
              postalCode: store.postalCode,
              phone: store.phone,
              email: store.email,
              isActive: store.isActive,
            },
          })
        )
      )

      // プランを作成
      await Promise.all(
        allPlans.map(plan => 
          prisma.plan.upsert({
            where: { id: plan.id },
            update: {},
            create: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price: plan.price,
              sessionsPerMonth: plan.sessionsPerMonth,
              durationMonths: plan.durationMonths || 1,
              features: plan.features,
              sortOrder: plan.sortOrder,
              isActive: true,
            },
          })
        )
      )

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
          stores: stores.length,
          plans: allPlans.length,
          trainers: 0,
          products: 0,
          events: 0,
          users: 1,
        },
      })
    }

    // プランリストも返す（カテゴリ別）
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, price: true, sessionsPerMonth: true, features: true },
    })

    // カテゴリ別に分類
    const categorizedPlans = {
      membership: plans.filter(p => {
        try {
          const f = JSON.parse(p.features || '{}')
          return f.category === 'membership'
        } catch { return false }
      }),
      personal: plans.filter(p => {
        try {
          const f = JSON.parse(p.features || '{}')
          return f.category === 'personal'
        } catch { return false }
      }),
      ticket: plans.filter(p => {
        try {
          const f = JSON.parse(p.features || '{}')
          return f.category === 'ticket'
        } catch { return false }
      }),
    }

    return NextResponse.json({
      initialized: plansCount > 0,
      counts: {
        stores: storesCount,
        plans: plansCount,
        trainers: trainersCount,
        products: productsCount,
        events: eventsCount,
        users: usersCount,
      },
      categorizedPlans,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'データベース接続エラー', details: String(error) },
      { status: 500 }
    )
  }
}
