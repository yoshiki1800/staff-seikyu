import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry || entry.staffId !== session.staff.id) {
      return NextResponse.json({ error: '権限がありません。' }, { status: 403 });
    }

    if (entry.status !== 'pending') {
      return NextResponse.json({ error: '請求済みのデータは削除できません。' }, { status: 400 });
    }

    await prisma.entry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete entry error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, course, sales, reward } = body;

    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry || entry.staffId !== session.staff.id) {
      return NextResponse.json({ error: '権限がありません。' }, { status: 403 });
    }

    if (entry.status !== 'pending') {
      return NextResponse.json({ error: '請求済みのデータは修正できません。' }, { status: 400 });
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        date: new Date(date),
        course,
        sales: Number(sales),
        reward: Number(reward),
      },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (err) {
    console.error('Update entry error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
