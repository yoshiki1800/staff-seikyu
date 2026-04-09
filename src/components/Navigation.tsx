"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, List, FileText, LogOut, User, CreditCard, Shield, Settings, History } from 'lucide-react';

interface NavigationProps {
  staffName: string;
  staffRole: string;
}

export default function Navigation({ staffName, staffRole }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: 'ホーム', href: '/dashboard', icon: Home },
    { name: '稼働入力', href: '/dashboard/entries', icon: List },
    { name: '作成', href: '/dashboard/invoices', icon: FileText },
    { name: '履歴', href: '/dashboard/invoices/history', icon: History },
    { name: '設定', href: '/dashboard/profile', icon: Settings },
  ];

  // 管理者専用メニュー
  if (staffRole === 'admin') {
    navItems.push({ name: 'スタッフ管理', href: '/dashboard/admin', icon: Shield });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 border-b border-border">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-1.5 bg-primary text-slate-900 rounded-lg premium-shadow group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <span className="font-black text-lg tracking-tight hidden md:block">BD-STFSEIKYU</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                <span className="hidden lg:block">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border">
            <User size={14} className="text-muted-foreground" />
            <span className="text-xs font-bold">{staffName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            title="ログアウト"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
