import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const isAdminView = searchParams.get('admin') === 'true' && session.staff.role === 'admin';

    const invoices = await prisma.invoice.findMany({
      where: isAdminView ? {} : { staffId: session.staff.id },
      include: {
        staff: {
          select: {
            name: true,
            realName: true,
          }
        },
        entries: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('Invoices API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
