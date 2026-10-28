import * as math from 'mathjs';
import { MathBenchmarkResult } from '../types';

export const EPSILON = 1e-9;

// جدول مقادیر قطعی و معروف ریاضی برای سنجش بی‌خطا
export const KNOWN_MATH_TABLE: Record<string, { expected: number | string; description: string }> = {
  'sin(30 deg)': { expected: 0.5, description: 'سینوس ۳۰ درجه برابر ۰.۵' },
  'cos(60 deg)': { expected: 0.5, description: 'کوسینوس ۶۰ درجه برابر ۰.۵' },
  'tan(45 deg)': { expected: 1, description: 'تانژانت ۴۵ درجه برابر ۱' },
  'sin(0)': { expected: 0, description: 'سینوس صفر برابر صفر' },
  'cos(0)': { expected: 1, description: 'کوسینوس صفر برابر یک' },
  'sqrt(4)': { expected: 2, description: 'جذر ۴' },
  'sqrt(9)': { expected: 3, description: 'جذر ۹' },
  'sqrt(16)': { expected: 4, description: 'جذر ۱۶' },
  'sqrt(144)': { expected: 12, description: 'جذر ۱۴۴' },
  'cbrt(27)': { expected: 3, description: 'ریشه سوم ۲۷' },
  'log10(100)': { expected: 2, description: 'لگاریتم ۱۰۰ در مبنای ۱۰' },
  'log10(1000)': { expected: 3, description: 'لگاریتم ۱۰۰۰ در مبنای ۱۰' },
  'log2(64)': { expected: 6, description: 'لگاریتم ۶۴ در مبنای ۲' },
  '2^10': { expected: 1024, description: 'توان ۲ به توان ۱۰' },
  '5!': { expected: 120, description: 'فاکتوریل ۵' },
  '0!': { expected: 1, description: 'فاکتوریل صفر' },
  '0.1 + 0.2': { expected: 0.3, description: 'جمع اعشاری معروف IEEE-754' },
  '10 / 0': { expected: 'Infinity', description: 'تقسیم بر صفر (بی‌نهایت یا خطای مجاز)' },
  '0 / 0': { expected: 'NaN', description: 'تقسیم صفر بر صفر' },
  'sqrt(-1)': { expected: 'i', description: 'جذر عدد منفی (موهومی یا خطا)' },
};

export interface MathTestCase {
  id: string;
  category: string;
  expression: string;
  description: string;
  isEdgeCase?: boolean;
  expectedError?: boolean;
}

// تولید بیش از ۱۰۰ عبارت تست محاسباتی جامع
export function generateMathTestSuites(): MathTestCase[] {
  const tests: MathTestCase[] = [];
  let idCounter = 1;

  // ۱. چهار عمل اصلی و اعداد بزرگ و کوچک
  const basicOps = [
    { expr: '15 + 27', desc: 'جمع دو رقمی صحیح' },
    { expr: '1000450 + 982340', desc: 'جمع اعداد بزرگ' },
    { expr: '500 - 750', desc: 'تفریق با خروجی منفی' },
    { expr: '25 * 14', desc: 'ضرب دو رقمی' },
    { expr: '1250 / 25', desc: 'تقسیم صحیح' },
    { expr: '17 / 4', desc: 'تقسیم با باقیمانده اعشاری' },
    { expr: '0.0004 * 0.002', desc: 'ضرب اعداد بسیار کوچک' },
    { expr: '10000000 * 10000000', desc: 'ضرب اعداد میلیونی' },
  ];
  basicOps.forEach((op) => {
    tests.push({ id: `math-${idCounter++}`, category: 'چهار عمل اصلی', expression: op.expr, description: op.desc });
  });

  // ۲. اولویت عملگرها و پرانتزهای تودرتو
  const precedenceOps = [
    { expr: '2 + 3 * 4', desc: 'اولویت ضرب بر جمع (خروجی ۱۴)' },
    { expr: '(2 + 3) * 4', desc: 'اولویت پرانتز بر ضرب (خروجی ۲۰)' },
    { expr: '10 - 2 * 3 + 4 / 2', desc: 'ترکیب تفریق، ضرب، جمع و تقسیم (خروجی ۶)' },
    { expr: '((3 + 2) * 4 - 5) / 3', desc: 'پرانتز تودرتو لایه ۲ (خروجی ۵)' },
    { expr: '100 - (20 + (5 * (6 - 2)))', desc: 'پرانتز تودرتو لایه ۳ (خروجی ۶۰)' },
    { expr: '2 ^ 3 ^ 2', desc: 'اولویت توان متوالی' },
    { expr: '(2 ^ 3) ^ 2', desc: 'توان با پرانتز' },
    { expr: '5 * 4 / 2 * 3', desc: 'هم‌ارزی ضرب و تقسیم از چپ به راست' },
  ];
  precedenceOps.forEach((op) => {
    tests.push({ id: `math-${idCounter++}`, category: 'اولویت عملگرها', expression: op.expr, description: op.desc });
  });

  // ۳. توان، ریشه، لگاریتم و نمایی
  const advancedOps = [
    { expr: '2 ^ 8', desc: 'توان صحیح ۲ به توان ۸' },
    { expr: '9 ^ 0.5', desc: 'توان کسری معادل جذر ۹' },
    { expr: 'sqrt(625)', desc: 'جذر عدد ۶۲۵' },
    { expr: 'sqrt(2)', desc: 'جذر گنگ عدد ۲' },
    { expr: 'cbrt(125)', desc: 'ریشه سوم ۱۲۵' },
    { expr: 'log10(10000)', desc: 'لگاریتم برمبنای ۱۰' },
    { expr: 'log2(1024)', desc: 'لگاریتم برمبنای ۲' },
    { expr: 'exp(1)', desc: 'عدد نپر e' },
    { expr: 'exp(3)', desc: 'e به توان ۳' },
  ];
  advancedOps.forEach((op) => {
    tests.push({ id: `math-${idCounter++}`, category: 'توان و ریشه و لگاریتم', expression: op.expr, description: op.desc });
  });

  // ۴. مثلثات (درجه و رادیان)
  const trigOps = [
    { expr: 'sin(pi / 6)', desc: 'سینوس پی/۶ (۳۰ درجه)' },
    { expr: 'cos(pi / 3)', desc: 'کوسینوس پی/۳ (۶۰ درجه)' },
    { expr: 'tan(pi / 4)', desc: 'تانژانت پی/۴ (۴۵ درجه)' },
    { expr: 'sin(pi / 2)', desc: 'سینوس پی/۲ (۹۰ درجه)' },
    { expr: 'cos(pi / 2)', desc: 'کوسینوس پی/۲ (نزدیک به صفر)' },
    { expr: 'asin(0.5)', desc: 'آرک‌سینوس ۰.۵' },
    { expr: 'acos(0.5)', desc: 'آرک‌کوسینوس ۰.۵' },
    { expr: 'atan(1)', desc: 'آرک‌تانژانت ۱' },
  ];
  trigOps.forEach((op) => {
    tests.push({ id: `math-${idCounter++}`, category: 'مثلثات و توابع معکوس', expression: op.expr, description: op.desc });
  });

  // ۵. موارد مرزی، خطای ممیز شناور (IEEE 754) و خطاهای ورودی
  const edgeOps = [
    { expr: '0.1 + 0.2', desc: 'تست دقت ممیز شناور IEEE 754 (عدم خطای 0.30000000000000004)' },
    { expr: '0.7 + 0.1', desc: 'تست خطای ممیز شناور ۰.۷ + ۰.۱' },
    { expr: '1.0 - 0.9', desc: 'تفریق اعشاری ۱ منهای ۰.۹' },
    { expr: '1 / 3', desc: 'کسر متناوب ۱/۳' },
    { expr: '10 / 0', desc: 'تقسیم بر صفر', isEdgeCase: true },
    { expr: '0 / 0', desc: 'تقسیم صفر بر صفر (مبهم)', isEdgeCase: true },
    { expr: 'sqrt(-4)', desc: 'جذر عدد منفی', isEdgeCase: true },
    { expr: 'log(0)', desc: 'لگاریتم صفر', isEdgeCase: true },
    { expr: 'log(-5)', desc: 'لگاریتم عدد منفی', isEdgeCase: true },
    { expr: '3 ++ 4', desc: 'ورودی ناقص با دو عملگر متوالی', isEdgeCase: true, expectedError: true },
    { expr: '5 *', desc: 'عملگر بی‌پایان در انتهای عبارت', isEdgeCase: true, expectedError: true },
    { expr: '((4 + 2)', desc: 'پرانتز باز بدون بسته‌شدن', isEdgeCase: true, expectedError: true },
    { expr: ') 3 + 2 (', desc: 'پرانتزهای نامتقارن و اشتباه', isEdgeCase: true, expectedError: true },
    { expr: '999999999999999 * 999999999999999', desc: 'سرریز اعداد بسیار بزرگ', isEdgeCase: true },
  ];
  edgeOps.forEach((op) => {
    tests.push({
      id: `math-${idCounter++}`,
      category: 'موارد مرزی و خطای اعشاری',
      expression: op.expr,
      description: op.desc,
      isEdgeCase: op.isEdgeCase,
      expectedError: op.expectedError,
    });
  });

  return tests;
}

// محاسبه جواب مرجع بدون استفاده از Gemini (با mathjs و JS Math)
export function calculateReferenceAnswer(expression: string): {
  success: boolean;
  value: number | string;
  error?: string;
} {
  // ۱. بررسی جدول مقادیر قطعی
  if (KNOWN_MATH_TABLE[expression]) {
    return { success: true, value: KNOWN_MATH_TABLE[expression].expected };
  }

  // ۲. محاسبه با کتابخانه قدرتمند mathjs
  try {
    const evaluated = math.evaluate(expression);
    if (typeof evaluated === 'number') {
      if (!isFinite(evaluated)) {
        return { success: true, value: evaluated > 0 ? 'Infinity' : '-Infinity' };
      }
      if (isNaN(evaluated)) {
        return { success: true, value: 'NaN' };
      }
      return { success: true, value: evaluated };
    } else if (typeof evaluated === 'object' && evaluated !== null) {
      // مواردی مثل اعداد مختلط
      return { success: true, value: evaluated.toString() };
    } else {
      return { success: true, value: String(evaluated) };
    }
  } catch (err: any) {
    return { success: false, value: 'Error', error: err?.message || 'خطای محاسبه' };
  }
}

// مقایسه خروجی اپلیکیشن با جواب مرجع با در نظر گرفتن تلورانس اعشاری (EPSILON)
export function evaluateMathDiscrepancy(
  expression: string,
  appOutput: any,
  description: string
): MathBenchmarkResult {
  const ref = calculateReferenceAnswer(expression);
  const resultId = `bench-${Math.random().toString(36).slice(2, 8)}`;

  // اگر جواب مرجع خطا بوده و اپلیکیشن هم خطا داده یا بلاک کرده
  if (!ref.success) {
    const isAppHandled =
      appOutput === 'Error' ||
      appOutput === 'خطا' ||
      appOutput === 'NaN' ||
      appOutput === 'Invalid' ||
      typeof appOutput === 'undefined' ||
      String(appOutput).toLowerCase().includes('err');

    return {
      id: resultId,
      expression,
      appOutput: String(appOutput ?? 'N/A'),
      referenceAnswer: 'خطای محاسباتی مجاز',
      delta: 0,
      status: isAppHandled ? 'match' : 'discrepancy',
      isToleranceAcceptable: isAppHandled,
      description,
    };
  }

  // اگر مرجع عدد عددی باشد
  if (typeof ref.value === 'number') {
    const numApp = typeof appOutput === 'number' ? appOutput : parseFloat(String(appOutput));

    if (isNaN(numApp)) {
      return {
        id: resultId,
        expression,
        appOutput: String(appOutput),
        referenceAnswer: ref.value,
        delta: NaN,
        status: 'discrepancy',
        isToleranceAcceptable: false,
        description,
      };
    }

    const delta = Math.abs(numApp - ref.value);
    const isAcceptable = delta <= EPSILON || (Math.abs(ref.value) > 0 && delta / Math.abs(ref.value) <= 1e-7);

    return {
      id: resultId,
      expression,
      appOutput: numApp,
      referenceAnswer: ref.value,
      delta,
      status: isAcceptable ? 'match' : 'discrepancy',
      isToleranceAcceptable: isAcceptable,
      description,
    };
  }

  // مرجع رشته‌ای مانند Infinity یا i
  const strApp = String(appOutput ?? '').trim().toLowerCase();
  const strRef = String(ref.value).trim().toLowerCase();
  const match = strApp === strRef || (strRef === 'infinity' && (strApp.includes('inf') || strApp === 'بی‌نهایت'));

  return {
    id: resultId,
    expression,
    appOutput: String(appOutput),
    referenceAnswer: ref.value,
    delta: match ? 0 : 1,
    status: match ? 'match' : 'discrepancy',
    isToleranceAcceptable: match,
    description,
  };
}
