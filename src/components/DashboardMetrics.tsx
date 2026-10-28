import React from 'react';
import { 
  CheckCircle2, 
  Bug, 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  AlertTriangle,
  RotateCw,
  TrendingUp
} from 'lucide-react';
import { RoundHistory } from '../types';

interface DashboardMetricsProps {
  currentRound: number;
  maxRounds: number;
  cleanRoundsCount: number;
  totalTestsRun: number;
  bugsFound: number;
  bugsFixed: number;
  activeBugsCount: number;
  roundHistories: RoundHistory[];
  isClean: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  currentRound,
  maxRounds,
  cleanRoundsCount,
  totalTestsRun,
  bugsFound,
  bugsFixed,
  activeBugsCount,
  roundHistories,
  isClean,
}) => {
  const roundProgressPercentage = Math.min(100, Math.round((currentRound / maxRounds) * 100));

  return (
    <div className="space-y-4">
      {/* پیام افتخار در صورت پایان موفق دورهای تست بدون باگ */}
      {isClean && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border border-emerald-600/70 shadow-lg shadow-emerald-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>تکمیل موفق ارزیابی:</span>
                <span className="text-emerald-400">هیچ باگ شناخته‌شده‌ای باقی نمانده است</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                پروژه در دو دور متوالی تحت صدها تست چندوجهی (عملکردی، امنیتی، مرزی، پایداری و رگرسیون) قرار گرفت و هیچ باگ جدیدی مشاهده نشد.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-xs font-mono text-emerald-300 shrink-0">
            <span>Clean Rounds: 2/2</span>
          </div>
        </div>
      )}

      {/* کارت‌های آماری اصلی */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* دور فعلی */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">دور تست فعلی</div>
            <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-1">
              <span>{currentRound}</span>
              <span className="text-xs font-normal text-slate-500">از {maxRounds}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        {/* کل تست‌های اجرا شده */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">تست‌های ارزیابی‌شده</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {totalTestsRun.toLocaleString('fa-IR')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        {/* باگ‌های کشف‌شده */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">کل باگ‌های کشف‌شده</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {bugsFound.toLocaleString('fa-IR')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bug className="w-4 h-4" />
          </div>
        </div>

        {/* باگ‌های رفع‌شده */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">باگ‌های رفع‌شده در کد</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {bugsFixed.toLocaleString('fa-IR')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wrench className="w-4 h-4" />
          </div>
        </div>

        {/* باگ‌های فعال فعلی */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <div className="text-[11px] font-medium text-slate-400">باگ‌های منتظر تایید</div>
            <div className={`text-xl font-bold font-mono mt-1 ${activeBugsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeBugsCount.toLocaleString('fa-IR')}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeBugsCount > 0 ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
            {activeBugsCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>

      </div>

      {/* نمودار تاریخچه دورها در صورت وجود چند دور */}
      {roundHistories.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>روند دورهای تست و دیباگ:</span>
            </span>
            <span className="text-[11px] text-slate-500">حداکثر ۱۰ دور برای مهار حلقه بی‌نهایت</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {roundHistories.map((h) => (
              <div
                key={h.round}
                className={`flex-1 min-w-[120px] p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                  h.cleanRound
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>دور {h.round}</span>
                  <span className="font-mono text-[10px] text-slate-500">{h.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>تست‌ها: {h.testsRun}</span>
                  <span className={h.bugsFound === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    باگ: {h.bugsFound}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
