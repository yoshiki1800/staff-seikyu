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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
      
      // 1. 選択されたエントリーのみを取得
      const entriesRes = await fetch(`/api/entries?ids=${ids.join(',')}`);
      const entriesData = await entriesRes.json();
      setEntries(entriesData.entries || []);

      // 2. スタッフ情報の詳細取得
      const targetStaffId = entriesData.entries && entriesData.entries.length > 0 
        ? entriesData.entries[0].staffId 
        : meData.staff.id;
      const staffRes = await fetch(`/api/staff/${targetStaffId}`);
      const staffData = await staffRes.json();
      setStaff(staffData.staff);
    } catch (err) {
      console.error('Fetch data error:', err);
      setError('データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = entries.reduce((sum, e) => sum + e.reward, 0);
  const dateObj = entries.length > 0 ? new Date(entries[0].date) : new Date();
  const yearStr = dateObj.getFullYear();
  const monthStr = dateObj.getMonth() + 1;
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const submitInvoice = async () => {
    if (!staff) return;
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryIds: ids,
          totalAmount,
          invoiceNumber,
          month: `${yearStr}年${monthStr}月`,
          origin: window.location.origin
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
      } else {
        setError(data.error || '送信に失敗しました。');
      }
    } catch (err: any) {
      console.error('Send error:', err);
      setError(`送信エラー: ${err.message || String(err)}`);
    } finally {
      setIsSending(false);
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !staff) return;
    setIsGeneratingPDF(true);
    setError(null);
    
    try {
      const element = invoiceRef.current;
      
      // キャプチャ精度を上げるため、スクロール位置をリセットした状態で取得
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('invoice-container');
          if (el) el.style.boxShadow = 'none';
        }
      });
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('描画エリアのキャプチャに失敗しました。要素が表示されているか確認してください。');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`請求書_${yearStr}年${monthStr}月_${staff.name}.pdf`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setError(`PDF保存エラー: ${err.message || String(err)}`);
    } finally {
      setIsGeneratingPDF(false);
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
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {isGeneratingPDF ? 'PDF生成中...' : 'PDFを保存'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:p-8">
        {/* Invoice Area */}
        <div className="lg:col-span-3">
          <div 
            ref={invoiceRef}
            className="bg-white text-[#0f172a] p-8 md:p-10 border border-[#e2e8f0] rounded-sm min-h-[1123px] w-[794px] max-w-full mx-auto font-sans"
            style={{ fontSize: '11px', lineHeight: '1.4' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-bold tracking-[0.5em] mb-2">請求書</h1>
                <p className="text-[#64748b] font-mono text-[9px]">No. {invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Recipient & Subject */}
            <div className="flex justify-between mb-10">
              <div className="space-y-4 flex-1">
                <div className="inline-block border-b-2 border-[#0f172a] pb-1 pr-10">
                  <p className="text-lg font-bold">株式会社VIBGYOR 御中</p>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-sm border-b border-[#94a3b8]">件名</span>
                    <h2 className="text-lg font-black">{yearStr}年 {monthStr}月分ご請求書の件</h2>
                </div>
                <p className="text-xs pt-2">下記の通り、ご請求申し上げます。</p>
              </div>
              
              {/* Sender Details */}
              <div className="text-right space-y-1 min-w-[200px]">
                <div className="flex justify-end gap-2 items-start mb-2">
                   <div className="text-right">
                        <p className="font-black text-sm">{staff?.realName || staff?.name}</p>
                        <p className="text-[9px] text-[#64748b] leading-tight">
                            {staff?.therapistName && `(セラピスト名: ${staff.therapistName})`}
                        </p>
                   </div>
                   {/* Seal placeholder */}
                   <div className="w-12 h-12 border border-[#fecaca] rounded-full flex items-center justify-center text-red-500 font-black text-[10px] transform rotate-[-5deg] ml-3">
                      <div className="border border-red-500 rounded-full w-10 h-10 flex items-center justify-center">
                        {staff?.realName?.slice(0, 2) || '印'}
                      </div>
                   </div>
                </div>
                <div className="text-[10px] text-[#475569] space-y-0.5">
                    <p className="flex items-center justify-end gap-1"><MapPin size={10} /> {staff?.address || '住所未設定'}</p>
                    <p className="flex items-center justify-end gap-1"><Phone size={10} /> {staff?.phone || '電話番号未設定'}</p>
                    <p className="flex items-center justify-end gap-1 text-[#94a3b8] font-mono">{staff?.email}</p>
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-[#f8fafc] p-4 border border-[#e2e8f0] rounded-lg mb-8 flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b]">ご請求合計金額 (税込)</span>
                <span className="text-2xl font-black">¥ {totalAmount.toLocaleString()} -</span>
            </div>

            {/* Items Table - Optimized for 20+ items */}
            <div className="min-h-[500px]">
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-[#f1f5f9] border-y border-[#cbd5e1]">
                            <th className="p-2 text-left w-20">日付</th>
                            <th className="p-2 text-left">内容 / コース</th>
                            <th className="p-2 text-right w-24">売上</th>
                            <th className="p-2 text-right w-24">ご請求額</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                        {entries.map((entry) => (
                        <tr key={entry.id} className="text-[10px]">
                            <td className="p-2 text-[#64748b]">{new Date(entry.date).toLocaleDateString('ja-JP')}</td>
                            <td className="p-2 font-medium">{entry.course}</td>
                            <td className="p-2 text-right text-[#94a3b8] italic">¥{entry.sales.toLocaleString()}</td>
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
                        <tr className="border-t-2 border-[#0f172a] border-double">
                            <td colSpan={3} className="p-2 text-right font-bold">合計金額</td>
                            <td className="p-2 text-right font-black text-sm">¥{totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Notes */}
            <div className="mt-auto pt-8 border-t border-[#f1f5f9]">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-[#64748b]">
                        <FileText size={14} /> 備考欄
                    </h3>
                    <div className="text-[10px] text-[#334155] font-bold bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                        {staff?.bankInfo || '※ 備考欄が未登録です。プロフィールから設定してください。'}
                    </div>
                </div>
                <div className="col-span-1 pt-8 text-right italic text-[9px] text-[#94a3b8]">
                    <p>備考:</p>
                    <p>お振込手数料はご負担願います。</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 text-center text-[#cbd5e1] text-[8px] tracking-[0.3em] font-mono">
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
                  onClick={submitInvoice}
                  disabled={isSending || !staff?.bankInfo || !staff?.realName}
                  className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-bold text-lg premium-shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  請求書を送信する
                </button>
                
                {(!staff?.bankInfo || !staff?.realName) && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> 情報を補完してください
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      請求書作成には「本名」と「備考欄（振込先）」の設定が必要です。プロフィールから設定してください。
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/profile')}
                      className="text-[10px] font-black text-primary hover:underline"
                    >
                      プロフィール設定へ移動 →
                    </button>
                  </div>
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
