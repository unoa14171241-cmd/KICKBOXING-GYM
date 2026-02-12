import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 会員のトレーニングレポート一覧取得
export async function GET(
    request: NextRequest,
    { params }: { params: { memberId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        const reports = await prisma.trainingReport.findMany({
            where: { memberId: params.memberId },
            include: {
                trainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { trainingDate: 'desc' },
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error('Error fetching training reports:', error)
        return NextResponse.json(
            { error: 'トレーニングレポートの取得に失敗しました' },
            { status: 500 }
        )
    }
}

// 新規トレーニングレポート作成
export async function POST(
    request: NextRequest,
    { params }: { params: { memberId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['owner', 'trainer'].includes(session.user.role)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 })
        }

        const body = await request.json()
        const {
            trainerId,
            trainingDate,
            duration,
            menuItems,
            trainerComment,
            nextGoal,
            physicalNote,
        } = body

        // バリデーション
        if (!trainerId || !trainingDate || !menuItems || !trainerComment) {
            return NextResponse.json(
                { error: '必須項目を入力してください' },
                { status: 400 }
            )
        }

        const report = await prisma.trainingReport.create({
            data: {
                memberId: params.memberId,
                trainerId,
                trainingDate: new Date(trainingDate),
                duration: duration || null,
                menuItems,
                trainerComment,
                nextGoal: nextGoal || null,
                physicalNote: physicalNote || null,
            },
            include: {
                trainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        })

        return NextResponse.json(report)
    } catch (error) {
        console.error('Error creating training report:', error)
        return NextResponse.json(
            { error: 'トレーニングレポートの作成に失敗しました' },
            { status: 500 }
        )
    }
}
