import React from 'react';
import { 
  Bug, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';

interface HeaderProps {
  currentRound: number;
  maxRounds: number;
  cleanRoundsCount: number;
  status: 'idle' | 'analyzing' | 'testing' | 'awaiting_approval' | 'fixing' | 'clean';
  onReset: () => void;
  onRestoreOriginal: () => void;
  hasOriginalBackup: boolean;
  onOpenHelp: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRound,
  maxRounds,
  cleanRoundsCount,
  status,
  onReset,
  onRestoreOriginal,
  hasOriginalBackup,
  onOpenHelp,
  darkMode,
  onToggleDarkMode,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return { text: 'آماده دریافت پروژه', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'analyzing':
        return { text: 'در حال تحلیل ساختار و طراحی تست...', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700 animate-pulse' };
      case 'testing':
        return { text: 'در حال اجرای صدها تست خودکار...', color: 'bg-cyan-900/60 text-cyan-300 border-cyan-700 animate-pulse' };
      case 'awaiting_approval':
        return { text: 'توقف: در انتظار تایید کاربر برای رفع باگ‌ها', color: 'bg-amber-900/60 text-amber-300 border-amber-700' };
      case 'fixing':
        return { text: 'در حال رفع خودکار باگ‌ها در کد...', color: 'bg-purple-900/60 text-purple-300 border-purple-700 animate-pulse' };
      case 'clean':
        return { text: 'تایید نهایی: هیچ باگ شناخته‌شده‌ای باقی نمانده', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-600' };
    }
  };

  const badge = getStatusBadge();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* لوگو و نام سامانه */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
            <Bug className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Auto Debugger</span>
                <span className="text-xs font-normal text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  سامانه هوشمند تست و دیباگ
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              تحلیل عمیق کد، اجرای زنده، ارزیابی چندبُعدی و اصلاح خودکار با Gemini
            </p>
          </div>
        </div>

        {/* نشانگر وضعیت و دورها */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${badge.color}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{badge.text}</span>
          </div>

          {currentRound > 0 && (
            <div className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-slate-300">
              <span className="text-slate-400">دور تست:</span>
              <span className="font-bold text-cyan-400 font-mono">{currentRound}</span>
              <span className="text-slate-500">از {maxRounds}</span>
            </div>
          )}

          {cleanRoundsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1.5 rounded-lg text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>دورهای بدون باگ: <strong className="font-mono">{cleanRoundsCount}/۲</strong></span>
            </div>
          )}
        </div>

        {/* دکمه‌های کنترل و تنظیمات */}
        <div className="flex items-center gap-2">
          {hasOriginalBackup && (
            <button
              onClick={onRestoreOriginal}
              title="بازگردانی به نسخه اصلی اولیه (Undo کل تغییرات)"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازگردانی نسخه اصلی</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            title="راهنمای چرخه کار و قوانین تست"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            title="شروع مجدد و پاکسازی پروژه جاری"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-400 border border-slate-700 transition-colors"
          >
            پروژه جدید
          </button>
        </div>

      </div>
    </header>
  );
};
