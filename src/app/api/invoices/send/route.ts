import { NextResponse } from 'next/server';
import { after } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { entryIds, totalAmount, invoiceNumber, month, origin } = await request.json();

    if (!entryIds || entryIds.length === 0) {
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
    const port = parseInt(process.env.SMTP_PORT || '587');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: port,
      secure: port === 465, // 465の場合はtrue、それ以外はfalse
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // メールの内容
    const mailOptions = {
      // SMTPプロバイダ（Xserver等）のスパム判定を避けるため、Fromは認証ユーザーにする
      from: `"${staff.name} (請求システム)" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
      replyTo: staff.email || undefined,
      to: 'info@backdoor-g.com',
      subject: `【請求書】${month}分_${staff.name}`,
      text: `${staff.name}です。\n\n${month}分の請求書を作成・提出しました。\n以下のURL（管理システム）から請求書の確認と、PDFのダウンロード・印刷を行ってください。\n\n${origin || 'https://seikyu-vb.vercel.app'}/dashboard/invoices/preview?ids=${entryIds.join(',')}\n\nよろしくお願いします。`
    };

    // デモ環境ではエラーを回避するために条件付き、またはモック動作にすることも検討
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('Missing SMTP configuration:', { smtpHost, smtpUser: !!smtpUser, smtpPass: !!smtpPass });
      return NextResponse.json({ 
        error: 'メール送信設定（SMTP）が未設定です。',
        details: '環境変数 (SMTP_HOST, SMTP_USER, SMTP_PASS) の設定を管理者へ依頼してください。'
      }, { status: 500 });
    }

    // 1. 先にデータベースの更新を行う (フロントエンド側で成功と判定させるため)
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

    // Entryのステータスを invoiced に更新
    await prisma.entry.updateMany({
      where: {
        id: { in: entryIds },
      },
      data: {
        status: 'invoiced',
        invoiceId: invoice.id,
      },
    });

    // 2. メール送信をバックグラウンドで実行 (Vercelのタイムアウトを回避)
    after(async () => {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Invoice email sent successfully to ${mailOptions.to} for staff ${staff.name}`);
      } catch (mailErr) {
        console.error('Mail Send Error (Background):', mailErr);
      }
    });

    return NextResponse.json({ success: true, invoiceId: invoice.id });
  } catch (error: any) {
    console.error('Invoice Send Route Error:', error);
    return NextResponse.json({ 
      error: 'サーバーエラーが発生しました。',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
