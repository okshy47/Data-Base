import React, { useState, useEffect } from 'react';

// تعريف واجهة الخصائص (Props Interface) لتحديد المدخلات المستقبلة من المكون الأب
interface SearchInputProps {
  onSearchChange: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearchChange }) => {
  // تعريف الحالة (State) المحلية لتخزين النص المكتوب في الخانة فوراً
  const [text, setText] = useState('');

  useEffect(() => {
    // 1. شرط الأداء: إذا كان النص أقل من حرفين، نظف نتائج البحث ولا ترهق المعالج
    if (text.trim().length < 2) {
      onSearchChange('');
      return;
    }

    // 2. تأخير الإدخال الذكي (Debouncing): انتظر 300 مللي ثانية بعد توقف المستخدم عن الكتابة
    const delayDebounceFn = setTimeout(() => {
      onSearchChange(text);
    }, 300);

    // 3. دالة التنظيف (Cleanup Function): حذف المؤقت الزمني القديم إذا استمر المستخدم في الكتابة بسرعة
    return () => clearTimeout(delayDebounceFn);
  }, [text, onSearchChange]);

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)} // تحديث لحظي وسلس جداً لقيمة الكتابة بدون أي تعليق
        placeholder="أدخل نص البحث (اسم، رقم جلوس، كود المادة)..."
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: '2px solid #00A3FF',
          backgroundColor: '#0B1B3D',
          color: '#FFF',
          fontSize: '16px',
          textAlign: 'right',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};
