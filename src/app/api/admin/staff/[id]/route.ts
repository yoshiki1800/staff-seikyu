import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// スタッフの更新 (管理者のみ)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.staff.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, pin, email, role, realName, therapistName, phone, address, bankInfo } = await request.json();

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name,
        pin,
        email,
        role,
        realName,
        therapistName,
        phone,
        address,
        bankInfo,
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (err) {
    console.error('Admin update staff error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// スタッフの削除 (管理者のみ)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.staff.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 自分自身は削除できないようにする
    if (session.staff.id === id) {
      return NextResponse.json({ error: '自分自身のアカウントは削除できません。' }, { status: 400 });
    }

    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin delete staff error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
