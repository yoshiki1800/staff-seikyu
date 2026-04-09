import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// スタッフ一覧の取得 (管理者のみ)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.staff.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        realName: true,
        therapistName: true,
        phone: true,
        address: true,
        bankInfo: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ staff });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 新しいスタッフの作成 (管理者のみ)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.staff.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, pin, email, role, realName, therapistName, phone, address, bankInfo } = await request.json();

    if (!name || !pin) {
      return NextResponse.json({ error: '名前と暗証番号は必須です。' }, { status: 400 });
    }

    const newStaff = await prisma.staff.create({
      data: {
        name,
        pin,
        email,
        role: role || 'staff',
        realName,
        therapistName,
        phone,
        address,
        bankInfo,
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'その名前のスタッフは既に登録されています。' }, { status: 400 });
    }
    console.error('Admin create staff error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
