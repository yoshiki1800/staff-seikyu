import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { staffId, pin } = await request.json();

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff || staff.pin !== pin) {
      return NextResponse.json({ error: '暗証番号が正しくありません。' }, { status: 401 });
    }

    await login({ id: staff.id, name: staff.name, role: staff.role });

    return NextResponse.json({ success: true, staff: { id: staff.id, name: staff.name, role: staff.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
