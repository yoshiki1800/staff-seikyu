"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ChevronRight, Loader2, CreditCard } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingStaff, setIsFetchingStaff] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/auth/staff');
        const data = await res.json();
        if (data.staff) {
          setStaffList(data.staff);
        }
      } catch (err) {
        console.error('Failed to fetch staff:', err);
      } finally {
        setIsFetchingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || pin.length < 4) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: selectedStaffId, pin }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'ログインに失敗しました。');
      }
    } catch (err) {
      setError('サーバー通信エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const clearPin = () => setPin('');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-slate-900 premium-shadow mb-4">
            <span className="text-2xl font-black">INV</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            <span className="block text-primary text-xl mb-2 tracking-[0.5em] uppercase">Staff Portal</span>
            BD-STFSEIKYU
          </h1>
        </div>

        <div className="glass premium-shadow rounded-[2rem] p-8 border border-white/20 dark:border-white/5 relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                スタッフ名
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-slate-900 dark:text-white disabled:opacity-50"
                  disabled={isFetchingStaff}
                  required
                >
                  <option value="">{isFetchingStaff ? '読込中...' : 'スタッフを選択してください'}</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                暗証番号 (4桁)
              </label>
              <div className="flex justify-between gap-3 px-2 mb-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx}
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                      pin.length > idx 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50'
                    }`}
                  >
                    {pin[idx] ? '●' : ''}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-100/30 dark:bg-slate-800/20 rounded-2xl">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'C') clearPin();
                      else if (key === '←') setPin(prev => prev.slice(0, -1));
                      else handlePinChange(key.toString());
                    }}
                    className="h-12 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-lg font-semibold active:scale-95 transition-all text-slate-900 dark:text-slate-100"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !selectedStaffId || pin.length < 4}
              className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  ログイン
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
