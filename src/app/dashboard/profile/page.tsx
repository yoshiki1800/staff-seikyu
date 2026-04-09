"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Building, CreditCard, User, Loader2, CheckCircle2, Phone, MapPin, BadgeCheck } from 'lucide-react';

interface StaffInfo {
  id: string;
  name: string;
  email: string | null;
  realName: string | null;
  therapistName: string | null;
  phone: string | null;
  address: string | null;
  bankInfo: string | null;
}

export default function ProfilePage() {
  const [info, setInfo] = useState<StaffInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      const staffRes = await fetch(`/api/staff/${data.staff.id}`);
      const staffData = await staffRes.json();
      setInfo(staffData.staff);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/staff/${info.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bankInfo: info.bankInfo, 
          email: info.email,
          realName: info.realName,
          therapistName: info.therapistName,
          phone: info.phone,
          address: info.address
        }),
      });

      if (res.ok) {
        setMessage('プロフィールを更新しました。');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          プロフィール設定
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          請求書に記載される詳細情報を設定します。
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-8">
          {/* 基本情報 */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <User size={20} className="text-primary" /> 基本情報
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">お名前（表示用）</label>
              <input type="text" value={info?.name || ''} disabled className="w-full bg-slate-100/30 dark:bg-slate-800/20 border border-border rounded-xl px-4 py-2.5 opacity-50 cursor-not-allowed font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">本名</label>
              <input 
                type="text" 
                value={info?.realName || ''} 
                onChange={(e) => setInfo(prev => prev ? { ...prev, realName: e.target.value } : null)}
                placeholder="山田 太郎"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">セラピスト名</label>
              <input 
                type="text" 
                value={info?.therapistName || ''} 
                onChange={(e) => setInfo(prev => prev ? { ...prev, therapistName: e.target.value } : null)}
                placeholder="Taro"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              />
            </div>
          </div>

          {/* 連絡先 */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Phone size={20} className="text-primary" /> 連絡先・住所
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">メールアドレス</label>
              <input 
                type="email" 
                value={info?.email || ''} 
                onChange={(e) => setInfo(prev => prev ? { ...prev, email: e.target.value } : null)}
                placeholder="staff@example.com"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">電話番号</label>
              <input 
                type="text" 
                value={info?.phone || ''} 
                onChange={(e) => setInfo(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="090-0000-0000"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">住所</label>
              <textarea 
                value={info?.address || ''} 
                onChange={(e) => setInfo(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="東京都〇〇区〇〇1-2-3 〇〇マンション101"
                rows={2}
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* 備考欄 */}
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Building size={20} className="text-primary" /> 備考欄
          </h3>
          <textarea 
            value={info?.bankInfo || ''} 
            onChange={(e) => setInfo(prev => prev ? { ...prev, bankInfo: e.target.value } : null)}
            placeholder="ここに記載した内容は請求書の備考欄に反映されます。"
            rows={4}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all custom-scrollbar resize-none font-bold"
          />
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-slate-900 py-5 rounded-[2rem] font-bold text-lg premium-shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            プロフィール設定を更新する
          </button>
        </div>
      </form>
    </div>
  );
}
