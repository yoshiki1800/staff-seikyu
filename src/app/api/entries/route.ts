import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// 仕事の記録一覧を取得
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const idsString = searchParams.get('ids');
    const ids = idsString ? idsString.split(',') : null;

    const entries = await prisma.entry.findMany({
      where: { 
        ...(session.staff.role === 'admin' ? {} : { staffId: session.staff.id }),
        ...(ids ? { id: { in: ids } } : {})
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 新しい仕事の記録を保存
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { date, course, sales, reward } = await request.json();

    if (!date || !course || sales === undefined || reward === undefined) {
      return NextResponse.json({ error: '入力項目が不足しています。' }, { status: 400 });
    }

    const entry = await prisma.entry.create({
      data: {
        date: new Date(date),
        course,
        sales: parseInt(sales),
        reward: parseInt(reward),
        staffId: session.staff.id,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
