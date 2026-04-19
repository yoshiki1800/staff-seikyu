"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, Trash2, Calendar, BookOpen, DollarSign, Award, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Entry {
  id: string;
  date: string;
  course: string;
  sales: number;
  reward: number;
  status: string;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [course, setCourse] = useState('');
  const [sales, setSales] = useState('');
  const [reward, setReward] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !course || !sales || !reward) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, course, sales, reward }),
      });

      if (res.ok) {
        setCourse('');
        setSales('');
        setReward('');
        fetchEntries();
        // 成功したらフォームを閉じる（任意）
        // setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || '保存に失敗しました。');
      }
    } catch (err) {
      setError('サーバーエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            稼働入力
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            日々の業務内容を記録しましょう。
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            showForm ? 'bg-slate-200 text-slate-700' : 'bg-primary text-slate-900 premium-shadow'
          }`}
        >
          {showForm ? <ChevronUp size={20} /> : <Plus size={20} />}
          {showForm ? 'フォームを閉じる' : '新規追加'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Calendar size={14} className="text-primary" /> 日付
                  </label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" /> コース名
                  </label>
                  <select 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                    required
                  >
                    <option value="" disabled>コースを選択してください</option>
                    <option value="個室オイル60分">個室オイル60分</option>
                    <option value="個室オイル90分">個室オイル90分</option>
                    <option value="個室オイル120分">個室オイル120分</option>
                    <option value="出張オイル60分">出張オイル60分</option>
                    <option value="出張オイル90分">出張オイル90分</option>
                    <option value="出張オイル120分">出張オイル120分</option>
                    <option value="VIOコース60分">VIOコース60分</option>
                    <option value="【体験】筋トレ75分">【体験】筋トレ75分</option>
                    <option value="筋トレ75分">筋トレ75分</option>
                    <option value="筋トレ100分">筋トレ100分</option>
                    <option value="ストレッチ60分">ストレッチ60分</option>
                    <option value="追加オイル30分">追加オイル30分</option>
                    <option value="追加オイル60分">追加オイル60分</option>
                    <option value="延長10分">延長10分</option>
                    <option value="延長20分">延長20分</option>
                    <option value="延長30分">延長30分</option>
                    <option value="前立腺オプション">前立腺オプション</option>
                    <option value="凹凸オプション">凹凸オプション</option>
                    <option value="交通費">交通費</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <DollarSign size={14} className="text-primary" /> 売上高 (税込)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">¥</span>
                    <input 
                      type="number" 
                      value={sales}
                      onChange={(e) => setSales(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Award size={14} className="text-primary" /> あなたへの報酬
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">¥</span>
                    <input 
                      type="number" 
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      placeholder="5000"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black text-primary"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="md:col-span-2 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                    {error}
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-bold premium-shadow hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                    記録を保存する
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-black text-lg flex items-center gap-2">
            <List size={20} className="text-primary" />
            入力履歴
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-secondary rounded-full text-muted-foreground">
            {entries.length} 件の記録
          </span>
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
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin inline-block text-primary" />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    まだ記録がありません。
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
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
                    <td className="px-6 py-4 text-right">
                      {entry.status === 'pending' && (
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
