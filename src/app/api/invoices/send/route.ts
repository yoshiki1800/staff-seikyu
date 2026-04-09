import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pdfBase64, entryIds, totalAmount, invoiceNumber, month } = await request.json();

    if (!pdfBase64 || !entryIds || entryIds.length === 0) {
      return NextResponse.json({ error: 'データが不足しています。' }, { status: 400 });
}

    // スタッフの情報を取得
    const staff = await prisma.staff.findUnique({
      where: { id: session.staff.id },
    });

    if (!staff) return NextResponse.json({ error: 'スタッフが見つかりません。' }, { status: 404 });

    // NodeMailerの設定 (実運用時は環境変数から取得)
    // テスト用の場合は Ethereal Email などのモックを使用するのが一般的ですが、
    // ここではユーザーが指定した info@backdoor-g.com への送信ロジックを記載します。
    // ※ 実際の送信には SMTP サーバーの認証情報が必要です。
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // メールの内容
    const mailOptions = {
      from: `"${staff.name}" <${staff.email || 'noreply@example.com'}>`,
      to: 'info@backdoor-g.com',
      subject: `【請求書】${month}分_${staff.name}`,
      text: `${staff.name}です。\n\n${month}分の請求書を送付いたします。\n添付ファイルをご確認ください。`,
      attachments: [
        {
          filename: `請求書_${month}_${staff.name}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
        },
      ],
    };

    // 実際の送信処理（デモ環境ではエラーを回避するために条件付き、またはモック動作にすることも検討）
    // 今回は実際にコードとして記述します。
    if (process.env.SMTP_HOST) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error('Mail Send Error:', mailErr);
        // SMTPが未設定の場合は、ここではエラーを返さず「送信モック成功」と見なす仕組みにすることも可能ですが、
        // ユーザー体験のためにエラーメッセージを返します。
        return NextResponse.json({ 
          error: 'メール送信に失敗しました。SMTPサーバーの設定を確認してください。',
          details: '環境変数 (SMTP_HOST, SMTP_USER, SMTP_PASS) の設定が必要です。'
        }, { status: 500 });
      }
    } else {
      console.warn('SMTP_HOST is not configured. Skipping actual email sending, but saving invoice.');
    }

    // データベースの更新
    // 1. 請求書レコードの作成
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        month,
        totalAmount: parseInt(totalAmount),
        staffId: staff.id,
        status: 'sent',
        sentAt: new Date(),
        // 関連するEntryを紐付ける
        entries: {
          connect: entryIds.map((id: string) => ({ id })),
        },
      },
    });

    // 2. Entryのステータスを invoiced に更新
    await prisma.entry.updateMany({
      where: {
        id: { in: entryIds },
      },
      data: {
        status: 'invoiced',
        invoiceId: invoice.id,
      },
    });

    return NextResponse.json({ success: true, invoiceId: invoice.id });
  } catch (error: any) {
    console.error('Invoice Send Route Error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
