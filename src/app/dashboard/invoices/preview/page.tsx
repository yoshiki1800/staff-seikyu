"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, Printer, Phone, MapPin, User, CreditCard, BadgeCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Entry {
  id: string;
  date: string;
  course: string;
  sales: number;
  reward: number;
}

interface Staff {
  id: string;
  name: string;
  email: string | null;
  realName: string | null;
  therapistName: string | null;
  phone: string | null;
  address: string | null;
  bankInfo: string | null;
}

export default function InvoicePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get('ids')?.split(',') || [];
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ids.length === 0) {
      router.push('/dashboard/invoices');
      return;
    }
    fetchData();
  }, [ids.length]);

  const fetchData = async () => {
    try {
      // セッション情報の取得
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      // スタッフ情報の詳細取得
      const staffRes = await fetch(`/api/staff/${meData.staff.id}`);
      const staffData = await staffRes.json();
      setStaff(staffData.staff);

      // 2. 選択されたエントリーのみを取得 (性能改善: IDsをクエリパラメータで渡す)
      const entriesRes = await fetch(`/api/entries?ids=${ids.join(',')}`);
      const entriesData = await entriesRes.json();
      setEntries(entriesData.entries);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = entries.reduce((sum, e) => sum + e.reward, 0);
  const dateObj = entries.length > 0 ? new Date(entries[0].date) : new Date();
  const yearStr = dateObj.getFullYear();
  const monthStr = dateObj.getMonth() + 1;
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const generateAndSendPDF = async () => {
    if (!invoiceRef.current || !staff) return;
    
    setIsSending(true);
    setError(null);

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      // APIへの送信
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          entryIds: ids,
          totalAmount,
          invoiceNumber,
          month: `${yearStr}年${monthStr}月`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
      } else {
        setError(data.error || '送信に失敗しました。');
      }
    } catch (err) {
      console.error('PDF/Send error:', err);
      setError('PDF生成または送信中にエラーが発生しました。');
    } finally {
      setIsSending(false);
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !staff) return;
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`請求書_${yearStr}年${monthStr}月_${staff.name}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('PDFのダウンロードに失敗しました。');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all"
        >
          <ChevronLeft size={20} />
          選択画面に戻る
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-border rounded-xl font-bold hover:bg-secondary transition-all"
          >
            <Printer size={18} />
            ブラウザで印刷
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
          >
            <FileText size={18} />
            PDFを保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:p-8">
        {/* Invoice Area */}
        <div className="lg:col-span-3">
          <div 
            ref={invoiceRef}
            className="bg-white text-slate-900 p-10 shadow-2xl rounded-sm min-h-[1123px] w-full max-w-[794px] mx-auto font-sans"
            style={{ fontSize: '11px', lineHeight: '1.4' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-bold tracking-[0.5em] mb-2">請求書</h1>
                <p className="text-slate-500 font-mono text-[9px]">No. {invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Recipient & Subject */}
            <div className="flex justify-between mb-10">
              <div className="space-y-4 flex-1">
                <div className="inline-block border-b-2 border-slate-900 pb-1 pr-10">
                  <p className="text-lg font-bold">株式会社VIBGYOR 御中</p>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-sm border-b border-slate-400">件名</span>
                    <h2 className="text-lg font-black">{yearStr}年 {monthStr}月分ご請求書の件</h2>
                </div>
                <p className="text-xs pt-2">下記の通り、ご請求申し上げます。</p>
              </div>
              
              {/* Sender Details */}
              <div className="text-right space-y-1 min-w-[200px]">
                <div className="flex justify-end gap-2 items-start mb-2">
                   <div className="text-right">
                        <p className="font-black text-sm">{staff?.realName || staff?.name}</p>
                        <p className="text-[9px] text-slate-500 leading-tight">
                            {staff?.therapistName && `(セラピスト名: ${staff.therapistName})`}
                        </p>
                   </div>
                   {/* Seal placeholder */}
                   <div className="w-12 h-12 border border-red-200 rounded-full flex items-center justify-center text-red-500 font-black text-[10px] transform rotate-[-5deg] ml-3">
                      <div className="border border-red-500 rounded-full w-10 h-10 flex items-center justify-center">
                        {staff?.realName?.slice(0, 2) || '印'}
                      </div>
                   </div>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5">
                    <p className="flex items-center justify-end gap-1"><MapPin size={10} /> {staff?.address || '住所未設定'}</p>
                    <p className="flex items-center justify-end gap-1"><Phone size={10} /> {staff?.phone || '電話番号未設定'}</p>
                    <p className="flex items-center justify-end gap-1 text-slate-400 font-mono">{staff?.email}</p>
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg mb-8 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ご請求合計金額 (税込)</span>
                <span className="text-2xl font-black">¥ {totalAmount.toLocaleString()} -</span>
            </div>

            {/* Items Table - Optimized for 20+ items */}
            <div className="min-h-[500px]">
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-y border-slate-300">
                            <th className="p-2 text-left w-20">日付</th>
                            <th className="p-2 text-left">内容 / コース</th>
                            <th className="p-2 text-right w-24">売上</th>
                            <th className="p-2 text-right w-24">ご請求額</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {entries.map((entry) => (
                        <tr key={entry.id} className="text-[10px]">
                            <td className="p-2 text-slate-600">{new Date(entry.date).toLocaleDateString('ja-JP')}</td>
                            <td className="p-2 font-medium">{entry.course}</td>
                            <td className="p-2 text-right text-slate-400 italic">¥{entry.sales.toLocaleString()}</td>
                            <td className="p-2 text-right font-bold">¥{entry.reward.toLocaleString()}</td>
                        </tr>
                        ))}
                        {/* Fill empty rows to maintain page layout if fewer than 20 items */}
                        {entries.length < 20 && Array.from({ length: 20 - entries.length }).map((_, i) => (
                            <tr key={`empty-${i}`} className="h-7 text-[10px]">
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-900 border-double">
                            <td colSpan={3} className="p-2 text-right font-bold">合計金額</td>
                            <td className="p-2 text-right font-black text-sm">¥{totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Notes */}
            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-500">
                        <FileText size={14} /> 備考欄
                    </h3>
                    <div className="text-[10px] text-slate-700 font-bold bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {staff?.bankInfo || '※ 備考欄が未登録です。プロフィールから設定してください。'}
                    </div>
                </div>
                <div className="col-span-1 pt-8 text-right italic text-[9px] text-slate-400">
                    <p>備考:</p>
                    <p>お振込手数料はご負担願います。</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 text-center text-slate-300 text-[8px] tracking-[0.3em] font-mono">
              - GENERATED BY BD-STFSEIKYU -
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1 space-y-6 no-print">
          <div className="glass p-6 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow sticky top-24">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <Send size={20} className="text-primary" /> 送信確認
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-100/50 p-4 rounded-xl text-xs space-y-2">
                <p className="flex justify-between"><span className="opacity-50">宛先</span> <strong>info@backdoor-g.com</strong></p>
                <div className="pt-2 border-t border-slate-200">
                    <p className="opacity-50 mb-1">件名 (自動生成)</p>
                    <p className="font-bold">【請求書】{yearStr}年{monthStr}月分_{staff?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <BadgeCheck size={14} className="text-emerald-500" /> 20項目まで1ページに最適化済み
              </div>
            </div>

            {isSent ? (
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <div className="bg-emerald-50 text-emerald-600 p-6 md:p-8 rounded-2xl mb-4 border border-emerald-100">
                    <CheckCircle2 size={48} className="mx-auto mb-4" />
                    <p className="font-black">送信完了しました</p>
                  </div>
                  <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">ホームに戻る</button>
               </motion.div>
            ) : (
              <div className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">{error}</div>}
                
                <button 
                  onClick={generateAndSendPDF}
                  disabled={isSending || !staff?.bankInfo || !staff?.realName}
                  className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-bold text-lg premium-shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  請求書を送信する
                </button>
                
                {(!staff?.bankInfo || !staff?.realName) && (
                  <p className="text-[10px] text-amber-600 font-bold text-center">
                    <AlertTriangle size={12} className="inline mr-1" /> 必要情報（本名・備考欄）が不足しています
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
