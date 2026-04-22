"use client";

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-4">
          <div className="bg-white shadow-2xl p-8 md:p-12 rounded-[2rem] max-w-lg w-full text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 mb-4">
              システムエラーが発生しました
            </h1>
            
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              表示に問題が発生しました。ブラウザによってページがクラッシュした可能性があります。<br/>
              システムデータは正常に保存されていますので、トップページへお戻りください。
            </p>

            <button
              onClick={() => window.location.href = "/"}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200"
            >
              <Home size={18} />
              トップページに戻る
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
