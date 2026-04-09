"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Loader2, Calendar, Download, Eye, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  month: string;
  totalAmount: number;
  status: string;
  sentAt: string;
  createdAt: string;
  staff: {
    name: string;
  };
  entries: any[];
}

export default function InvoiceHistoryPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            請求書履歴
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            過去に作成・送信した請求書の一覧です。
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="glass p-12 rounded-[2rem] text-center border border-white/20 dark:border-white/5 premium-shadow">
          <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 text-slate-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">請求書データはありません</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            まだ請求書を作成していません。稼働データから請求書を作成しましょう。
          </p>
          <button 
            onClick={() => router.push('/dashboard/invoices')}
            className="bg-primary text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            請求書を作成する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice, i) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow relative overflow-hidden group hover:scale-[1.02] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  invoice.status === 'sent' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {invoice.status === 'sent' ? '送信済み' : '下書き'}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">No. {invoice.invoiceNumber}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{invoice.month}分</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white">¥{invoice.totalAmount.toLocaleString()}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                  <Calendar size={12} />
                  {new Date(invoice.sentAt || invoice.createdAt).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex gap-2">
                   {/* プレビュー画面を再利用して表示する（読み取り専用モードなどがあれば理想的） */}
                   <button 
                    onClick={() => {
                        const ids = invoice.entries.map(e => e.id).join(',');
                        router.push(`/dashboard/invoices/preview?ids=${ids}`);
                    }}
                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                   >
                     <Eye size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
