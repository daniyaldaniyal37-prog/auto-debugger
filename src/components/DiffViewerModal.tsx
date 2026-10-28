import React, { useState } from 'react';
import { 
  X, 
  Check, 
  FileCode, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Layers
} from 'lucide-react';
import { ModifiedFileDiff } from '../types';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffs: ModifiedFileDiff[];
  fixReport: string;
  onProceedToNextRound: () => void;
  roundNumber: number;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  diffs,
  fixReport,
  onProceedToNextRound,
  roundNumber,
}) => {
  if (!isOpen || diffs.length === 0) return null;

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const currentDiff = diffs[activeFileIndex] || diffs[0];

  // محاسبه تغییرات خط به خط برای نمایش تمیز قبل و بعد
  const oldLines = (currentDiff.previousContent || '').split('\n');
  const newLines = (currentDiff.updatedContent || '').split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* هدر مدال */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                تغییرات اعمال‌شده در کدها (تفاوت قبل و بعد / Diff دور {roundNumber})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              کدهای زیر جهت برطرف‌سازی باگ‌های تایید شده تغییر یافته‌اند. قبل از شروع دور بعدی تست‌ها، مقایسه کنید.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* گزارش خلاصه رفع باگ‌ها */}
        {fixReport && (
          <div className="bg-emerald-950/30 border-b border-emerald-900/50 px-5 py-3 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{fixReport}</span>
          </div>
        )}

        {/* تب‌های فایل‌های اصلاح‌شده */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto shrink-0">
          {diffs.map((d, idx) => (
            <button
              key={d.fileName}
              onClick={() => setActiveFileIndex(idx)}
              className={`py-3 px-3.5 border-b-2 text-xs font-mono font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeFileIndex === idx
                  ? 'border-cyan-400 text-cyan-300 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{d.fileName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                اصلاح شد
              </span>
            </button>
          ))}
        </div>

        {/* توضیح تغییرات فایل جاری */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between shrink-0">
          <span className="text-slate-400">
            خلاصه اصلاح: <strong className="text-slate-200">{currentDiff.summaryOfChanges}</strong>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            سطرهای قبلی: {oldLines.length} | سطرهای جدید: {newLines.length}
          </span>
        </div>

        {/* مقایسه دو ستونه قبل و بعد */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-800 overflow-hidden font-mono text-xs">
          
          {/* ستون کد قبلی */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-950/80">
            <div className="px-4 py-2 bg-rose-950/30 text-rose-300 border-b border-rose-900/40 font-sans font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span>نسخه قبل (دارای باگ)</span>
              <span className="text-[10px] text-rose-400 font-mono">Original</span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-0.5 text-slate-400">
              {oldLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-3 hover:bg-slate-900/80 px-1 py-0.5 rounded">
                  <span className="w-8 text-[10px] text-slate-600 select-none text-left shrink-0">
                    {idx + 1}
                  </span>
                  <pre className="text-[11px] break-all whitespace-pre-wrap flex-1 text-slate-300">
                    {line || ' '}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* ستون کد جدید اصلاح‌شده */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-950/90">
            <div className="px-4 py-2 bg-emerald-950/30 text-emerald-300 border-b border-emerald-900/40 font-sans font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span>نسخه اصلاح‌شده جدید</span>
              <span className="text-[10px] text-emerald-400 font-mono">Patched & Verified</span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-0.5 text-emerald-300">
              {newLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-emerald-950/15 hover:bg-emerald-950/30 px-1 py-0.5 rounded border-r-2 border-emerald-500">
                  <span className="w-8 text-[10px] text-emerald-600 select-none text-left shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <pre className="text-[11px] break-all whitespace-pre-wrap flex-1 text-emerald-200">
                    {line || ' '}
                  </pre>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* فوتر مدال و دکمه ادامه به دور بعدی */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            مشاهده گزارش باگ‌ها
          </button>

          <button
            onClick={() => {
              onClose();
              onProceedToNextRound();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>تایید اصلاحات و آغاز دور {roundNumber + 1} تست‌ها (با تست‌های رگرسیون)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
