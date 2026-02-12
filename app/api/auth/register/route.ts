import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateMemberNumber, generateQRCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      firstNameKana,
      lastNameKana,
      phone,
      dateOfBirth,
      gender,
      planId,
      storeId,
    } = body

    // バリデーション
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    // 店舗のバリデーション
    if (!storeId) {
      return NextResponse.json(
        { error: '店舗を選択してください' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーと会員情報を作成
    // planIdが空文字列の場合はnullに変換
    const validPlanId = planId && planId.trim() !== '' ? planId : null

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'member',
        member: {
          create: {
            firstName,
            lastName,
            firstNameKana: firstNameKana || '',
            lastNameKana: lastNameKana || '',
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            memberNumber: generateMemberNumber(),
            qrCode: generateQRCode(),
            planId: validPlanId,
            storeId: storeId,
            status: 'active',
            remainingSessions: 0,
          },
        },
      },
      include: {
        member: true,
      },
    })

    return NextResponse.json({
      message: '会員登録が完了しました',
      user: {
        id: user.id,
        email: user.email,
        memberNumber: user.member?.memberNumber,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '登録処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
