import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// トレーニングレポート詳細取得
export async function GET(
    request: NextRequest,
    { params }: { params: { reportId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        const report = await prisma.trainingReport.findUnique({
            where: { id: params.reportId },
            include: {
                trainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                member: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        memberNumber: true,
                    },
                },
            },
        })

        if (!report) {
            return NextResponse.json(
                { error: 'レポートが見つかりません' },
                { status: 404 }
            )
        }

        return NextResponse.json(report)
    } catch (error) {
        console.error('Error fetching training report:', error)
        return NextResponse.json(
            { error: 'トレーニングレポートの取得に失敗しました' },
            { status: 500 }
        )
    }
}

// トレーニングレポート更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { reportId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['owner', 'trainer'].includes(session.user.role)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 })
        }

        const body = await request.json()
        const {
            trainingDate,
            duration,
            menuItems,
            trainerComment,
            nextGoal,
            physicalNote,
        } = body

        const report = await prisma.trainingReport.update({
            where: { id: params.reportId },
            data: {
                trainingDate: trainingDate ? new Date(trainingDate) : undefined,
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
        console.error('Error updating training report:', error)
        return NextResponse.json(
            { error: 'トレーニングレポートの更新に失敗しました' },
            { status: 500 }
        )
    }
}

// トレーニングレポート削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { reportId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'owner') {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 })
        }

        await prisma.trainingReport.delete({
            where: { id: params.reportId },
        })

        return NextResponse.json({ success: true, message: 'レポートを削除しました' })
    } catch (error) {
        console.error('Error deleting training report:', error)
        return NextResponse.json(
            { error: 'トレーニングレポートの削除に失敗しました' },
            { status: 500 }
        )
    }
}
