"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, CheckCircle2, ChevronRight, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Entry {
  id: string;
  date: string;
  course: string;
  sales: number;
  reward: number;
  status: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEntries();
  }, []);

  const fetchPendingEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      if (data.entries) {
        // 未請求のものだけをフィルタリング
        setEntries(data.entries.filter((e: Entry) => e.status === 'pending'));
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map(e => e.id)));
    }
  };

  const totalReward = entries
    .filter(e => selectedIds.has(e.id))
    .reduce((sum, e) => sum + e.reward, 0);

  const handleNextStep = () => {
    if (selectedIds.size === 0) return;
    
    // 選択されたIDを一時的に保存してプレビューへ（あるいはURLパラメータで渡す）
    const ids = Array.from(selectedIds).join(',');
    router.push(`/dashboard/invoices/preview?ids=${ids}`);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            請求書作成
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            請求に含める稼働データを選択してください。
          </p>
        </div>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-primary/5 border border-primary/20 p-2 pl-6 rounded-2xl"
          >
            <div className="text-right">
              <p className="text-[10px] font-bold text-primary uppercase">選択中の合計報酬</p>
              <p className="text-xl font-black text-primary">¥{totalReward.toLocaleString()}</p>
            </div>
            <button 
              onClick={handleNextStep}
              className="bg-primary text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
            >
              請求書を作成する <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="glass p-12 rounded-[2rem] text-center border border-white/20 dark:border-white/5 premium-shadow">
          <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 text-slate-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">未請求のデータはありません</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            すべての案件が請求済み、またはまだ稼働データが入力されていません。
          </p>
          <button 
            onClick={() => router.push('/dashboard/entries')}
            className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-border transition-all duration-200 active:scale-95"
          >
            稼働を入力する
          </button>
        </div>
      ) : (
        <div className="glass rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <button 
              onClick={selectAll}
              className="text-sm font-bold text-primary hover:underline flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              {selectedIds.size === entries.length ? '全選択を解除' : 'すべての未請求を選択'}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {entries.length} 件の対象案件
            </span>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4">日付</th>
                  <th className="px-6 py-4">コース</th>
                  <th className="px-6 py-4 text-right">売上</th>
                  <th className="px-6 py-4 text-right">報酬</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => {
                  const isSelected = selectedIds.has(entry.id);
                  return (
                    <tr 
                      key={entry.id} 
                      onClick={() => toggleSelection(entry.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          readOnly
                          checked={isSelected}
                          className="w-6 h-6 accent-emerald-500 pointer-events-none shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {new Date(entry.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{entry.course}</td>
                      <td className="px-6 py-4 text-sm font-black text-right">
                        ¥{entry.sales.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-sm font-black text-right ${isSelected ? 'text-primary' : ''}`}>
                        ¥{entry.reward.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
