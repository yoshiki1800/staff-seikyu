"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Clock, Plus, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SummaryData {
  count: number;
  totalSales: number;
  totalReward: number;
}

interface Entry {
  id: string;
  date: string;
  course: string;
  sales: number;
  reward: number;
  status: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<{ summary: SummaryData; recentEntries: Entry[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/entries/summary');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-primary"
        >
          <Clock size={40} />
        </motion.div>
      </div>
    );
  }

  const cards = [
    { 
      label: '未請求の報酬', 
      value: `¥${data?.summary.totalReward.toLocaleString() || 0}`, 
      icon: CreditCard,
      color: 'bg-blue-500', 
      textColor: 'text-blue-600' 
    },
    { 
      label: '案件数', 
      value: `${data?.summary.count || 0} 件`, 
      icon: Clock,
      color: 'bg-purple-500', 
      textColor: 'text-purple-600' 
    },
    { 
      label: '今月の売上累計', 
      value: `¥${data?.summary.totalSales.toLocaleString() || 0}`, 
      icon: TrendingUp,
      color: 'bg-emerald-500', 
      textColor: 'text-emerald-600' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            こんにちは！
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            今月の稼働状況を確認しましょう。
          </p>
        </div>
        <Link 
          href="/dashboard/entries"
          className="inline-flex items-center gap-2 bg-primary text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all premium-shadow group"
        >
          <Plus size={20} />
          稼働を入力する
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color}/5 blur-3xl rounded-full`} />
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                <card.icon size={24} />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-black text-lg flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            最近の入力
          </h2>
          <Link href="/dashboard/entries" className="text-sm font-bold text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">日付</th>
                <th className="px-6 py-4">コース</th>
                <th className="px-6 py-4 text-right">売上</th>
                <th className="px-6 py-4 text-right">報酬</th>
                <th className="px-6 py-4 text-center">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    まだデータがありません。「稼働を入力する」から開始しましょう！
                  </td>
                </tr>
              ) : (
                data?.recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">
                      {new Date(entry.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.course}</td>
                    <td className="px-6 py-4 text-sm font-black text-right">
                      ¥{entry.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-right text-primary">
                      ¥{entry.reward.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        entry.status === 'pending' 
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' 
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      }`}>
                        {entry.status === 'pending' ? '未請求' : '請求済'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
