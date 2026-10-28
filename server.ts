import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));

// Initialize Google Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GEMINI_MODEL = 'gemini-3.8-flash';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Analyze project structure and generate test plan
app.post('/api/analyze-project', async (req, res) => {
  try {
    const { files, userDescription } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'فایلی ارسال نشده است' });
    }

    const fileSummary = files.map((f: { name: string; size: number; content?: string }) => ({
      name: f.name,
      size: f.size,
      snippet: f.content ? f.content.slice(0, 1500) : ''
    }));

    const prompt = `
شما یک مهندس ارشد تست و تضمین کیفیت نرم‌افزار (QA & Automated Debugging Engineer) هستید.
اطلاعات ساختار فایلهای پروژه کاربر به شرح زیر است:
توضیحات کاربر درباره هدف اپلیکیشن: "${userDescription || 'بدون توضیح اضافی'}"

لیست فایلها و خلاصه کدهای ارسالی:
${JSON.stringify(fileSummary, null, 2)}

وظایف شما:
1. تشخیص نوع دقیق پروژه: 
   - Web App (HTML/CSS/JS/React/Vue/Svelte)
   - Calculator or Math Engine (محاسباتی و فرمولی)
   - Node.js Backend / API
   - Python Application / Script
   - Android Project (Kotlin / Java / Android XML)
   - Other
2. آیا این پروژه یک ماشین‌حساب یا سیستم محاسباتی است؟ (isCalculator: true/false)
3. شناسایی فایل اصلی ورودی (entry point)
4. طرح تست جامع با جزئیات تستهای پیشنهادی در ۷ دسته:
   - عملکردی (Functional)
   - مقادیر مرزی و ورودی‌های نامعتبر (Boundary & Edge cases)
   - امنیت (Security & Vulnerabilities)
   - کارایی و پرفورمنس (Performance & Memory)
   - ریسپانسیو و رابط کاربری (UI, Responsive & Accessibility)
   - پایداری و تاب‌آوری (Chaos, Stress & Resilience)
   - کیفیت کد و خطاهای منطقی (Code Quality & Logic)
5. خلاصه‌ای از معماری پروژه به زبان فارسی

پاسخ را دقیقاً در فرمت JSON زیر برگردانید بدون هیچ کاراکتر اضافی یا مارک‌داون بیرون از JSON:
{
  "projectType": "web" | "calculator" | "nodejs" | "python" | "android" | "other",
  "projectTypeLabel": "عنوان فارسی نوع پروژه",
  "isCalculator": boolean,
  "entryFile": "نام فایل ورودی اصلی",
  "frameworksDetected": ["React", "Tailwind", ...],
  "architectureSummary": "توضیح کوتاه ساختار به فارسی",
  "totalEstimatedTests": number,
  "categories": [
    {
      "id": "functional",
      "title": "تست‌های عملکردی",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "boundary",
      "title": "مقادیر مرزی و ورودی‌های نامعتبر",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "security",
      "title": "امنیت و آسیب‌پذیری‌ها",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "performance",
      "title": "کارایی، حافظه و منابع",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "ui_responsive",
      "title": "ریسپانسیو، چیدمان و دسترس‌پذیری",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "resilience",
      "title": "پایداری، خطاها و استرس",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    },
    {
      "id": "code_quality",
      "title": "کیفیت کد و خطاهای منطقی",
      "plannedCount": number,
      "description": "توضیح دسته",
      "keyTestCases": ["نام چند مورد تست نمونه"]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing project:', error);
    return res.status(500).json({
      error: 'خطا در تحلیل پروژه با هوش مصنوعی',
      details: error?.message || String(error),
    });
  }
});

// Run Deep Code Analysis & Gemini Simulated Execution
app.post('/api/run-ai-tests', async (req, res) => {
  try {
    const {
      files,
      projectType,
      isCalculator,
      userDescription,
      roundNumber,
      category,
      liveErrors,
      mathDiscrepancies,
      attemptedFixBugs,
    } = req.body;

    const fullFilesPayload = (files || []).map((f: { name: string; content: string }) => ({
      name: f.name,
      content: f.content.length > 30000 ? f.content.slice(0, 30000) + '\n... [truncated]' : f.content,
    }));

    const prompt = `
شما تحلیل‌گر ارشد کدهای نرم‌افزاری و دیباگر خودکار (Automated Debugger) هستید.
دور تست فعلی: دور ${roundNumber}
دسته تست مورد بررسی: ${category ? category : 'تمام دسته‌های تست'}
نوع پروژه: ${projectType} ${isCalculator ? '(محاسباتی و ماشین حساب - توجه ویژه به دقت و منطق)' : ''}
توضیح کاربر: "${userDescription || ''}"

${liveErrors && liveErrors.length > 0 ? `خطاهای ثبت‌شده از اجرای زنده در مرورگر (Live Sandbox):\n${JSON.stringify(liveErrors, null, 2)}\n` : ''}
${mathDiscrepancies && mathDiscrepancies.length > 0 ? `اختلاف‌های محاسباتی با کتابخانه مرجع ریاضی (Math.js Engine):\n${JSON.stringify(mathDiscrepancies, null, 2)}\n` : ''}
${attemptedFixBugs && attemptedFixBugs.length > 0 ? `باگ‌هایی که قبلاً اصلاح شده‌اند (تست رگرسیون برای اطمینان از عدم بازگشت باگ):\n${JSON.stringify(attemptedFixBugs, null, 2)}\n` : ''}

کدهای پروژه:
${JSON.stringify(fullFilesPayload, null, 2)}

دستورالعمل‌ها:
1. پروژه را به طور عمیق برای خطاهای واقعی کالبدشکافی کن:
   - خطاهای سینتکس، متغیرهای تعریف نشده یا null/undefined
   - باگ‌های منطقی (Logical Flaws)
   - خطاهای امنیتی واقعی (XSS، کلید‌های API هاردکد شده، تزریق، ذخیره‌سازی ناامن)
   - خطاهای مدیریت رویداد و ورودی‌های مرزی (متن خالی، اعداد منفی، خطای اعشاری)
   - برای پروژه‌های اندروید/پایتون/نود: شبیه‌سازی منطق و تحلیل استاتیک دقیق انجام بده و حتماً در شرح بنویس "تحلیل استاتیک و شبیه‌سازی منطقی"
   - اگر دور ۲ یا بالاتر است، تست‌های رگرسیون را بررسی کن و تست‌های جدید و متفاوتی را ارزیابی نما. اگر واقعاً کدی باگ جدیدی ندارد، باگ ساختگی تولید نکن تا بعد از دو دور پاک بودن، پروژه تایید شود.
2. هر باگ را با ساختار مشخص برگردان:
   - id یکتا
   - title: عنوان فارسی و دقیق باگ
   - severity: یکی از این ۴ مقدار: "بحرانی" | "مهم" | "متوسط" | "جزئی"
   - category: یکی از: "functional" | "boundary" | "security" | "performance" | "ui_responsive" | "resilience" | "code_quality"
   - fileName: نام فایلی که باگ در آن است
   - lineNumber: شماره خط تقریبی که باگ در آن رخ داده
   - codeSnippet: قطعه کد مشکل‌دار
   - description: شرح دقیق مشکل به فارسی
   - reproductionSteps: مراحل بازتولید باگ به زبان فارسی (گام به گام)
   - suggestedFix: راهکار پیشنهادی دقیق برای رفع مشکل
   - isRegression: آیا این یک باگ رگرسیون است یا جدید؟

خروجی باید صرفاً یک آبجکت JSON معتبر به شکل زیر باشد:
{
  "testExecutionSummary": {
    "totalCasesEvaluated": number (حداقل بین ۳۰ تا ۸۰ تست در هر دور),
    "passedTests": number,
    "failedTests": number
  },
  "bugs": [
    {
      "id": "bug-1",
      "title": "عنوان باگ",
      "severity": "بحرانی" | "مهم" | "متوسط" | "جزئی",
      "category": "functional",
      "fileName": "script.js",
      "lineNumber": 42,
      "codeSnippet": "...",
      "description": "...",
      "reproductionSteps": ["1. ...", "2. ..."],
      "suggestedFix": "...",
      "isRegression": false
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error running AI tests:', error);
    return res.status(500).json({
      error: 'خطا در ارزیابی تست‌ها توسط هوش مصنوعی',
      details: error?.message || String(error),
    });
  }
});

// Fix selected bugs and generate unified diff / updated files
app.post('/api/fix-bugs', async (req, res) => {
  try {
    const { files, bugsToFix, roundNumber } = req.body;
    if (!files || !bugsToFix || bugsToFix.length === 0) {
      return res.status(400).json({ error: 'اطلاعات باگ‌ها یا فایل‌ها کامل نیست' });
    }

    const prompt = `
شما یک متخصص ارشد بازنویسی و ریفکتورینگ کد هستید.
کاربر تایید کرده است که باگ‌های زیر باید در کدهای پروژه اصلاح شوند:

لیست باگ‌های تایید شده برای رفع:
${JSON.stringify(bugsToFix, null, 2)}

کدهای فعلی پروژه:
${JSON.stringify(files, null, 2)}

دستورالعمل‌ها:
1. فایل‌های مربوطه را اصلاح کن تا باگ‌های تایید شده برطرف شوند.
2. هیچ ویژگی موجود را نشکن و به تمیزی و ساختار کد احترام بگذار.
3. در صورت نیاز به افزودن اعتبارسنجی ورودی، try/catch، دقت اعشاری (EPSILON)، پیشگیری از XSS، اصلاح فرمول ریاضی و غیره، به درستی در کد اعمال کن.
4. برای هر فایل تغییر یافته، کل محتوای جدید فایل ("updatedContent") را به همراه خلاصه تغییرات و diff خطی برگردان.

پاسخ را در فرمت JSON زیر برگردانید:
{
  "modifiedFiles": [
    {
      "fileName": "نام فایل",
      "updatedContent": "کل محتوای جدید فایل اصلاح شده",
      "summaryOfChanges": "توضیح کوتاه تغییرات انجام شده به فارسی",
      "fixedBugIds": ["bug-1", "bug-2"]
    }
  ],
  "fixReport": "گزارش کلی نحوه رفع باگ‌ها به فارسی"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error fixing bugs:', error);
    return res.status(500).json({
      error: 'خطا در رفع خودکار باگ‌ها',
      details: error?.message || String(error),
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Auto Debugger server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
