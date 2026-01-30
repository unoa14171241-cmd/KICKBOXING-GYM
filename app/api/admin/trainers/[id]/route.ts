import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, specialization, bio, isActive } = body

    const trainer = await prisma.trainer.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        specialization,
        bio,
        isActive,
      },
    })

    return NextResponse.json({ trainer })
  } catch (error) {
    console.error('Error updating trainer:', error)
    return NextResponse.json({ error: 'トレーナーの更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: params.id },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'トレーナーが見つかりません' }, { status: 404 })
    }

    // ユーザーも一緒に削除
    await prisma.user.delete({
      where: { id: trainer.userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trainer:', error)
    return NextResponse.json({ error: 'トレーナーの削除に失敗しました' }, { status: 500 })
  }
}
