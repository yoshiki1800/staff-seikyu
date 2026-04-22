"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      <div className="glass premium-shadow p-8 md:p-12 rounded-[2rem] max-w-lg w-full text-center border border-white/20 dark:border-white/5">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          読み込みエラーが発生しました
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed">
          一時的な通信エラー、または表示の不具合が発生しました。
          システム自体は正常に稼働していますのでご安心ください。
        </p>

        <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono p-4 rounded-xl mb-8 overflow-auto break-words text-left max-h-32">
          <strong>Debug Info:</strong><br />
          {error?.message || "Unknown Error"}<br />
          Digest: {error?.digest || "N/A"}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-slate-900 py-4- md:py-4 rounded-xl font-bold hover:bg-primary/90 transition-all duration-200 active:scale-95"
            style={{ padding: '16px 0' }}
          >
            <RefreshCcw size={18} />
            ページを再読み込みする
          </button>
          
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white py-4- md:py-4 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
            style={{ padding: '16px 0' }}
          >
            <Home size={18} />
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
