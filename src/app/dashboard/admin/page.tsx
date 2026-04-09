"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Key, Trash2, Loader2, CheckCircle2, AlertTriangle, Mail, Edit3, X, Phone, MapPin, User, FileText, ChevronRight, Eye } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string | null;
  role: string;
  realName: string | null;
  therapistName: string | null;
  phone: string | null;
  address: string | null;
  bankInfo: string | null;
  createdAt: string;
  newPin?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'staff' | 'invoices'>('staff');
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  
  // 登録用フォーム
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('staff');

  // 編集用
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff();
    fetchAllInvoices();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.status === 401) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      if (data.staff) setStaff(data.staff);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      if (activeTab === 'staff') setIsLoading(false);
    }
  };

  const fetchAllInvoices = async () => {
    try {
      const res = await fetch('/api/invoices?admin=true');
      if (res.status === 401) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      if (data.invoices) setAllInvoices(data.invoices);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      if (activeTab === 'invoices') setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, pin: newPin, email: newEmail, role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'スタッフを登録しました。' });
        setNewName('');
        setNewPin('');
        setNewEmail('');
        fetchStaff();
      } else {
        setMessage({ type: 'error', text: data.error || '登録に失敗しました。' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'サーバーエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/staff/${editingStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: editingStaff.newPin || undefined,
          email: editingStaff.email,
          bankInfo: editingStaff.bankInfo,
          realName: editingStaff.realName,
          therapistName: editingStaff.therapistName,
          phone: editingStaff.phone,
          address: editingStaff.address
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'スタッフ情報を更新しました。' });
        setEditingStaff(null);
        fetchStaff();
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このスタッフを削除してもよろしいですか？')) return;

    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'スタッフを削除しました。' });
        fetchStaff();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            スタッフ管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            スタッフの登録、情報の管理、権限設定を行います。
          </p>
        </div>
        
        {message && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {message.text}
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 border-b border-border pb-px">
        <button 
          onClick={() => setActiveTab('staff')}
          className={`pb-4 px-2 font-black text-sm transition-all relative ${activeTab === 'staff' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          スタッフ一覧
          {activeTab === 'staff' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-4 px-2 font-black text-sm transition-all relative ${activeTab === 'invoices' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          全請求書
          {activeTab === 'invoices' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'staff' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:p-8">
          {/* Registration Form */}
          <div className="lg:col-span-1">
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow sticky top-24">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-primary" /> 新規スタッフ登録
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">お名前（表示用）</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="スタッフ名" className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">暗証番号 (4桁)</label>
                <input type="text" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="0000" className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-widest font-bold" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">基本メール</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="staff@example.com" className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">権限</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                  <option value="staff">一般スタッフ</option>
                  <option value="admin">管理者</option>
                </select>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-primary text-slate-900 py-3.5 rounded-xl font-bold premium-shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                スタッフを追加する
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow overflow-hidden">
            <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Users size={18} className="text-primary" /> 登録スタッフ一覧
              </h3>
            </div>

            <div className="overflow-x-auto text-[13px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-border text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">スタッフ（表示/本名）</th>
                    <th className="px-6 py-4">セラピスト名</th>
                    <th className="px-6 py-4">連絡先</th>
                    <th className="px-4 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className="font-black text-slate-900">{s.name}</div>
                           {s.role === 'admin' && <Shield size={14} className="text-purple-500" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">{s.realName || '(本名未設定)'}</div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-500">
                        {s.therapistName || '-'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[11px] font-medium text-slate-600 italic">{s.email || '-'}</div>
                        <div className="text-[11px] text-slate-400">{s.phone || '-'}</div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingStaff(s)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow overflow-hidden">
          <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold flex items-center gap-2">
              <FileText size={18} className="text-primary" /> 全スタッフの送信済み請求書
            </h3>
          </div>
          <div className="overflow-x-auto text-[13px]">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-border text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">請求番号</th>
                  <th className="px-6 py-4">スタッフ</th>
                  <th className="px-6 py-4">対象月</th>
                  <th className="px-6 py-4 text-right">金額</th>
                  <th className="px-6 py-4">送信日</th>
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-5 font-mono text-slate-500">{inv.invoiceNumber}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900">{inv.staff.name}</div>
                      <div className="text-[11px] text-slate-500">{inv.staff.realName || '-'}</div>
                    </td>
                    <td className="px-6 py-5 font-bold">{inv.month}</td>
                    <td className="px-6 py-5 text-right font-black">¥{inv.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-slate-500">
                      {new Date(inv.sentAt || inv.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => {
                          const ids = inv.entries.map((e: any) => e.id).join(',');
                          window.open(`/dashboard/invoices/preview?ids=${ids}`, '_blank');
                        }}
                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="詳細を表示"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingStaff(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-6 md:p-8 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-2"><Edit3 className="text-primary" /> スタッフ情報の詳細編集</h3>
                    <button onClick={() => setEditingStaff(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X /></button>
                </div>
                <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">表示名 (変更不可)</label>
                            <input type="text" value={editingStaff.name} disabled className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold opacity-60" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">新しい暗証番号 (変更する場合)</label>
                            <input type="text" maxLength={4} value={editingStaff.newPin || ''} onChange={e => setEditingStaff({...editingStaff, newPin: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-mono tracking-widest font-bold" placeholder="****" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">本名</label>
                            <input type="text" value={editingStaff.realName || ''} onChange={e => setEditingStaff({...editingStaff, realName: e.target.value})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold" placeholder="山田 太郎" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">セラピスト名</label>
                            <input type="text" value={editingStaff.therapistName || ''} onChange={e => setEditingStaff({...editingStaff, therapistName: e.target.value})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold" placeholder="Taro" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">メール</label>
                            <input type="email" value={editingStaff.email || ''} onChange={e => setEditingStaff({...editingStaff, email: e.target.value})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold" placeholder="staff@example.com" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">電話番号</label>
                            <input type="text" value={editingStaff.phone || ''} onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold" placeholder="090-0000-0000" />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">住所</label>
                            <input type="text" value={editingStaff.address || ''} onChange={e => setEditingStaff({...editingStaff, address: e.target.value})} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold" placeholder="東京都..." />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">備考欄</label>
                            <textarea value={editingStaff.bankInfo || ''} onChange={e => setEditingStaff({...editingStaff, bankInfo: e.target.value})} rows={3} className="w-full bg-slate-100 border border-border rounded-xl px-4 py-3 font-bold resize-none" placeholder="備考や振込先など..." />
                        </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-black premium-shadow hover:bg-primary/90 transition-all">保存する</button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
