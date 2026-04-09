import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// 特定のスタッフ情報を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.staff.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        bankInfo: true,
        realName: true,
        therapistName: true,
        phone: true,
        address: true
      },
    });

    return NextResponse.json({ staff });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// スタッフ情報を更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || (session.staff.id !== id && session.staff.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bankInfo, email, realName, therapistName, phone, address } = await request.json();

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        bankInfo,
        email,
        realName,
        therapistName,
        phone,
        address,
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
