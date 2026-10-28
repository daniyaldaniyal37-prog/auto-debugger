import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  UploadCloud, 
  FolderPlus, 
  FileCode2, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Layers,
  Calculator,
  ShoppingBag,
  Smartphone
} from 'lucide-react';
import { ProjectFile } from '../types';
import { SAMPLE_PROJECTS, SampleProject } from '../services/sampleProjects';

interface UploadZoneProps {
  onFilesLoaded: (files: ProjectFile[], userDescription?: string) => void;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesLoaded, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [loadedFiles, setLoadedFiles] = useState<ProjectFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnzipping, setIsUnzipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // خواندن فایل ZIP با JSZip
  const handleZipFile = async (file: File) => {
    setIsUnzipping(true);
    setErrorMsg(null);
    try {
      const zip = new JSZip();
      const unzipped = await zip.loadAsync(file);
      const parsedFiles: ProjectFile[] = [];

      for (const [relativePath, zipEntry] of Object.entries(unzipped.files)) {
        if (!zipEntry.dir) {
          // نادیده گرفتن فایلهای غیرضروری مثل node_modules یا .git یا تصاویر باینری حجیم
          if (
            relativePath.includes('node_modules/') ||
            relativePath.includes('.git/') ||
            relativePath.startsWith('__MACOSX') ||
            relativePath.endsWith('.DS_Store')
          ) {
            continue;
          }

          const textContent = await zipEntry.async('text');
          parsedFiles.push({
            name: zipEntry.name.split('/').pop() || zipEntry.name,
            path: relativePath,
            content: textContent,
            originalContent: textContent,
            size: textContent.length,
          });
        }
      }

      if (parsedFiles.length === 0) {
        throw new Error('هیچ فایل متنی معتبری در فایل فشرده یافت نشد.');
      }

      setLoadedFiles(parsedFiles);
    } catch (err: any) {
      setErrorMsg(`خطا در باز کردن فایل فشرده ZIP: ${err?.message || err}`);
    } finally {
      setIsUnzipping(false);
    }
  };

  // پردازش فایل‌های مستقیم انتخاب شده
  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    // اگر اولین فایل ZIP است
    if (fileList.length === 1 && fileList[0].name.toLowerCase().endsWith('.zip')) {
      await handleZipFile(fileList[0]);
      return;
    }

    const filesArray: ProjectFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (
        f.name.includes('node_modules') ||
        f.name.startsWith('.') ||
        f.name.endsWith('.png') ||
        f.name.endsWith('.jpg') ||
        f.name.endsWith('.ico')
      ) {
        continue;
      }

      try {
        const text = await f.text();
        const relPath = (f as any).webkitRelativePath || f.name;
        filesArray.push({
          name: f.name,
          path: relPath,
          content: text,
          originalContent: text,
          size: text.length,
        });
      } catch (err) {
        console.warn('Skipping unreadable file:', f.name);
      }
    }

    if (filesArray.length === 0) {
      setErrorMsg('هیچ فایل معتبری انتخاب نشد.');
      return;
    }

    setLoadedFiles(filesArray);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleSampleSelect = (sample: SampleProject) => {
    setLoadedFiles(sample.files);
    setUserDescription(sample.userGoal);
  };

  const handleStartAnalysis = () => {
    if (loadedFiles.length === 0) return;
    onFilesLoaded(loadedFiles, userDescription);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      
      {/* پیام و عنوان اصلی */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          بارگذاری کدهای اپلیکیشن برای تست، عیب‌یابی و رفع خودکار
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          فایل ZIP یا پوشه پروژه خود را آپلود کنید. اتودیباگر با اجرای زنده در ساندباکس و تحلیل هوش مصنوعی، صدها تست عملکردی، امنیتی، مرزی و ریاضی روی آن انجام داده و با تایید شما کد را اصلاح می‌کند.
        </p>
      </div>

      {/* ناحیه درگ اند دراپ */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center transition-all duration-200 relative ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/30 ring-4 ring-cyan-500/20'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.html,.css,.js,.jsx,.ts,.tsx,.json,.py,.kt,.java,.xml"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-200">
              فایل‌های پروژه را اینجا رها کنید، یا از دکمه‌های زیر انتخاب کنید
            </p>
            <p className="text-xs text-slate-500">
              پشتیبانی از فایل‌های ZIP، وب (HTML/CSS/JS/React/Vue)، نود، پایتون و کاتلین/اندروید
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all flex items-center gap-1.5"
            >
              <FileCode2 className="w-4 h-4" />
              <span>انتخاب فایل ZIP یا چند فایل</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>انتخاب یک پوشه کامل</span>
            </button>
          </div>

          {isUnzipping && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs animate-pulse pt-2">
              <Sparkles className="w-4 h-4" />
              <span>در حال استخراج و تحلیل فایل فشرده ZIP...</span>
            </div>
          )}
        </div>
      </div>

      {/* پیام خطا در صورت وجود */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/80 text-red-300 text-xs p-3.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* پروژه‌های نمونه آماده تست با یک کلیک */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>پروژه‌های نمونه آماده برای ارزیابی آنی (همراه با باگ‌های واقعی):</span>
          </h3>
          <span className="text-xs text-slate-500">بدون نیاز به فایل شخصی، یک نمونه را انتخاب کنید</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SAMPLE_PROJECTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleSelect(sample)}
              className="text-right p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/50">
                    {sample.badge}
                  </span>
                  {sample.type === 'calculator' && <Calculator className="w-4 h-4 text-amber-400" />}
                  {sample.type === 'web' && <ShoppingBag className="w-4 h-4 text-emerald-400" />}
                  {sample.type === 'android' && <Smartphone className="w-4 h-4 text-purple-400" />}
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="pt-3 text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                <span>بارگذاری این پروژه</span>
                <span>←</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* فیلد اختیاری توضیحات کاربر و پیش‌نمایش فایل‌ها */}
      {loadedFiles.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                تعداد {loadedFiles.length} فایل آماده برای ارزیابی و تست
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setLoadedFiles([])}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              پاک کردن همه
            </button>
          </div>

          {/* فیلد توضیح هدف اپلیکیشن */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              توضیح اختیاری درباره هدف و عملکرد مورد انتظار از اپلیکیشن:
            </label>
            <textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="مثال: این برنامه باید یک ماشین‌حساب مهندسی دقیق باشد که اولویت عملگرها را رعایت کند، ممیز شناور را درست محاسبه کند و توابع مثلثاتی آن در واحد درجه کار کند..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* لیست فایل‌ها */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">فایل‌های شناسایی‌شده:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {loadedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 font-mono text-[11px] truncate" title={f.path || f.name}>
                      {f.path || f.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono mr-1">
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* دکمه شروع تست و عیب‌یابی */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>در حال تحلیل ساختار پروژه با Gemini...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>آغاز تحلیل، تدوین طرح تست و اجرای صدها تست خودکار</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
