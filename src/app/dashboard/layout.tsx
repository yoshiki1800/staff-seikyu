import { getSession } from '@/lib/auth';
import Navigation from '@/components/Navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation 
        staffName={session?.staff?.name || ''} 
        staffRole={session?.staff?.role || 'staff'} 
      />
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
