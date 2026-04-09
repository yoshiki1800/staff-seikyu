import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const staffId = session.staff.id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 今月の未請求（pending）データの集計
    const pendingStats = await prisma.entry.aggregate({
      where: {
        staffId,
        status: 'pending',
      },
      _sum: {
        sales: true,
        reward: true,
      },
      _count: true,
    });

    // 直近の入力データ5件
    const recentEntries = await prisma.entry.findMany({
      where: { staffId },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      summary: {
        count: pendingStats._count || 0,
        totalSales: pendingStats._sum.sales || 0,
        totalReward: pendingStats._sum.reward || 0,
      },
      recentEntries,
    });
  } catch (error: any) {
    console.error('Summary API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
