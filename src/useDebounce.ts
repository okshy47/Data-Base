// useDebounce.ts
import { useState, useEffect } from 'react';

// خطاف (Hook) مخصص لتأخير الاستجابة (Debounce) لمنع تجمد الشاشة (Lag) أثناء البحث
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // تحديث القيمة فقط بعد مرور الوقت المحدد بدون كتابة
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // تنظيف المؤقت (Timer) إذا قام المستخدم بكتابة حرف جديد قبل انتهاء الوقت
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // يعاد التشغيل عند تغير القيمة أو وقت التأخير

  return debouncedValue;
}
