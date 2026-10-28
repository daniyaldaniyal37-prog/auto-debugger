import React, { useState } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Hash, 
  Search, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { MathBenchmarkResult } from '../types';

interface MathBenchmarkPanelProps {
  results: MathBenchmarkResult[];
  isRunning: boolean;
}

export const MathBenchmarkPanel: React.FC<MathBenchmarkPanelProps> = ({
  results,
  isRunning,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'discrepancy' | 'match'>('all');

  const filteredResults = results.filter((r) => {
    const matchesSearch = r.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'discrepancy') return r.status === 'discrepancy';
    if (statusFilter === 'match') return r.status === 'match';
    return true;
  });

  const matchesCount = results.filter((r) => r.status === 'match').length;
  const discrepanciesCount = results.filter((r) => r.status === 'discrepancy').length;
  const accuracyRate = results.length > 0 ? Math.round((matchesCount / results.length) * 100) : 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      
      {/* هدر پنل بنچمارک محاسباتی */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              سنجش فوق‌دقیق محاسباتی (Reference Engine با Math.js)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            پاسخ‌های مرجع مستقیماً با کتابخانه Math.js و توابع دقیق JavaScript بدون تکیه بر LLM محاسبه و با خروجی اپلیکیشن مقایسه شده‌اند.
          </p>
        </div>

        {/* شاخص‌های دقت */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">درصد دقت خروجی</span>
            <span className={`text-sm font-bold font-mono ${accuracyRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
              %{accuracyRate}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">اختلاف‌های محاسباتی</span>
            <span className={`text-sm font-bold font-mono ${discrepanciesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {discrepanciesCount}
            </span>
          </div>
        </div>
      </div>

      {/* یادآوری قانون تلورانس و عدم خطای کاذب */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
        <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          برای مقادیر ممیز شناور از تلورانس خطای گردکردن (<code className="font-mono text-cyan-300">EPSILON = 1e-9</code>) استفاده شده تا خطای گردکردن استاندارد رایانه به اشتباه باگ ثبت نشود.
        </span>
      </div>

      {/* فیلترها و جستجو */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی عبارت ریاضی (مانند sin, 0.1, sqrt)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            همه ({results.length})
          </button>
          <button
            onClick={() => setStatusFilter('discrepancy')}
            className={`px-3 py-1 rounded-lg ${statusFilter === 'discrepancy' ? 'bg-rose-950/60 text-rose-300' : 'text-slate-400'}`}
          >
            دارای اختلاف ({discrepanciesCount})
          </button>
          <button
            onClick={() => setStatusFilter('match')}
            className={`px-3 py-1 rounded-lg ${statusFilter === 'match' ? 'bg-emerald-950/60 text-emerald-300' : 'text-slate-400'}`}
          >
            مطابق ({matchesCount})
          </button>
        </div>
      </div>

      {/* جدول مقایسه عبارات ریاضی */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-3">عبارت ریاضی ورودی</th>
                <th className="p-3">خروجی اپلیکیشن</th>
                <th className="p-3">جواب مرجع (Math.js)</th>
                <th className="p-3">اختلاف عددی (Delta)</th>
                <th className="p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                    هیچ نتیجه‌ای یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      item.status === 'discrepancy' ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="p-3 text-slate-200 font-semibold">
                      <span>{item.expression}</span>
                      <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                        {item.description}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      <span className={item.status === 'discrepancy' ? 'text-rose-400 font-bold' : ''}>
                        {String(item.appOutput)}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 font-semibold">
                      {String(item.referenceAnswer)}
                    </td>
                    <td className="p-3 text-slate-400">
                      {isNaN(item.delta)
                        ? 'N/A'
                        : item.delta === 0
                        ? '۰'
                        : item.delta.toExponential(3)}
                    </td>
                    <td className="p-3 font-sans">
                      {item.status === 'match' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تطابق کامل</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                          <XCircle className="w-3 h-3" />
                          <span>باگ / اختلاف</span>
                        </span>
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
};
