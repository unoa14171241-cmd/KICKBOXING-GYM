import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // プランを作成
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: 'plan-light' },
      update: {},
      create: {
        id: 'plan-light',
        name: 'ライト',
        description: '週1回ペースでトレーニングしたい方向け',
        price: 19800,
        sessionsPerMonth: 4,
        durationMonths: 1,
        features: JSON.stringify(['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約']),
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.plan.upsert({
      where: { id: 'plan-standard' },
      update: {},
      create: {
        id: 'plan-standard',
        name: 'スタンダード',
        description: '週2回ペースでしっかりトレーニングしたい方向け',
        price: 34800,
        sessionsPerMonth: 8,
        durationMonths: 1,
        features: JSON.stringify(['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約', 'グローブ貸出無料', 'イベント優先参加']),
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.plan.upsert({
      where: { id: 'plan-premium' },
      update: {},
      create: {
        id: 'plan-premium',
        name: 'プレミアム',
        description: '本格的にトレーニングしたい方向け',
        price: 49800,
        sessionsPerMonth: 0, // 無制限
        durationMonths: 1,
        features: JSON.stringify(['パーソナルトレーニング', '更衣室・シャワー利用', 'オンライン予約', 'グローブ貸出無料', 'イベント優先参加', '栄養指導', 'プロテイン提供']),
        isActive: true,
        sortOrder: 3,
      },
    }),
  ])
  console.log('✅ Plans created')

  // 管理者ユーザーを作成
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blaze-gym.jp' },
    update: {},
    create: {
      email: 'admin@blaze-gym.jp',
      password: adminPassword,
      role: 'owner',
    },
  })
  console.log('✅ Admin user created')

  // トレーナーを作成
  const trainerPassword = await bcrypt.hash('trainer123', 12)
  const trainers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'yamada@blaze-gym.jp' },
      update: {},
      create: {
        email: 'yamada@blaze-gym.jp',
        password: trainerPassword,
        role: 'trainer',
        trainer: {
          create: {
            firstName: '太郎',
            lastName: '山田',
            specialization: 'キックボクシング・ボクシング',
            bio: '元プロキックボクサー。10年以上の指導経験を持つベテラントレーナー。',
            isActive: true,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'sato@blaze-gym.jp' },
      update: {},
      create: {
        email: 'sato@blaze-gym.jp',
        password: trainerPassword,
        role: 'trainer',
        trainer: {
          create: {
            firstName: '花子',
            lastName: '佐藤',
            specialization: 'フィットネスキックボクシング',
            bio: '女性専門トレーナー。ダイエットやボディメイクを得意としています。',
            isActive: true,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'tanaka@blaze-gym.jp' },
      update: {},
      create: {
        email: 'tanaka@blaze-gym.jp',
        password: trainerPassword,
        role: 'trainer',
        trainer: {
          create: {
            firstName: '健太',
            lastName: '田中',
            specialization: 'ムエタイ・総合格闘技',
            bio: 'ムエタイの本場タイで修行経験あり。競技志向の方に最適です。',
            isActive: true,
          },
        },
      },
    }),
  ])
  console.log('✅ Trainers created')

  // 商品を作成
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-gloves-1' },
      update: {},
      create: {
        id: 'product-gloves-1',
        name: 'BLAZEオリジナルグローブ 14oz',
        description: 'トレーニング用高品質ボクシンググローブ。手首のサポート力が高く、長時間の使用でも快適です。',
        price: 12800,
        category: 'gloves',
        stock: 20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-gloves-2' },
      update: {},
      create: {
        id: 'product-gloves-2',
        name: 'BLAZEオリジナルグローブ 16oz',
        description: 'スパーリング用ボクシンググローブ。クッション性が高く安全にトレーニングできます。',
        price: 14800,
        category: 'gloves',
        stock: 15,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-wraps-1' },
      update: {},
      create: {
        id: 'product-wraps-1',
        name: 'バンテージ 4.5m',
        description: '伸縮性のある練習用バンテージ。手首と拳をしっかり保護します。',
        price: 1500,
        category: 'wraps',
        stock: 50,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-apparel-1' },
      update: {},
      create: {
        id: 'product-apparel-1',
        name: 'BLAZEドライTシャツ',
        description: '吸汗速乾素材のトレーニングTシャツ。BLAZEロゴ入り。',
        price: 4500,
        category: 'apparel',
        stock: 30,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-supplement-1' },
      update: {},
      create: {
        id: 'product-supplement-1',
        name: 'ホエイプロテイン 1kg',
        description: '高品質ホエイプロテイン。トレーニング後の筋肉回復をサポート。',
        price: 5800,
        category: 'supplements',
        stock: 25,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Products created')

  // イベントを作成
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        title: 'キックボクシング入門セミナー',
        description: '初心者向けのキックボクシング基礎セミナーです。基本的なスタンスやパンチ、キックの打ち方を学びます。',
        date: nextMonth,
        startTime: '14:00',
        endTime: '16:00',
        location: 'BLAZE GYM メインスタジオ',
        capacity: 20,
        price: 0,
        eventType: 'seminar',
        isPublished: true,
      },
    }),
    prisma.event.upsert({
      where: { id: 'event-2' },
      update: {},
      create: {
        id: 'event-2',
        title: 'スパーリング大会',
        description: '会員同士でのスパーリング大会。経験レベルに応じたマッチングで安全に試合を楽しめます。',
        date: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '17:00',
        location: 'BLAZE GYM メインスタジオ',
        capacity: 30,
        price: 3000,
        eventType: 'competition',
        isPublished: true,
      },
    }),
    prisma.event.upsert({
      where: { id: 'event-3' },
      update: {},
      create: {
        id: 'event-3',
        title: 'ミット打ちワークショップ',
        description: 'プロトレーナーによるミット打ちの実践ワークショップ。コンビネーションの組み立て方を学びます。',
        date: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '21:00',
        location: 'BLAZE GYM メインスタジオ',
        capacity: 15,
        price: 2000,
        eventType: 'workshop',
        isPublished: true,
      },
    }),
  ])
  console.log('✅ Events created')

  // デモ会員を作成
  const memberPassword = await bcrypt.hash('member123', 12)
  const demoMember = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: memberPassword,
      role: 'member',
      member: {
        create: {
          firstName: '太郎',
          lastName: 'テスト',
          firstNameKana: 'タロウ',
          lastNameKana: 'テスト',
          phone: '090-1234-5678',
          memberNumber: 'BKG-DEMO-0001',
          qrCode: 'DEMO1234567890AB',
          planId: 'plan-standard',
          status: 'active',
          remainingSessions: 6,
        },
      },
    },
  })
  console.log('✅ Demo member created')

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📋 Test Accounts:')
  console.log('   Admin: admin@blaze-gym.jp / admin123')
  console.log('   Trainer: yamada@blaze-gym.jp / trainer123')
  console.log('   Member: demo@example.com / member123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
