import React, { useState, useEffect } from 'react';

// تعريف مدخلات المكون (Props)
interface SearchInputProps {
  onSearchChange: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearchChange }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // حد أدنى: إذا كان الحرف وحيداً لا ترهق المعالج بالبحث
    if (text.trim().length < 2) {
      onSearchChange('');
      return;
    }

    // تقسيط الاستدعاء الزمني: انتظر 300 مللي ثانية بعد توقف المستخدم عن الكتابة
    const delayDebounce = setTimeout(() => {
      onSearchChange(text);
    }, 300);

    // تنظيف المؤقت عند كتابة حرف جديد بسرعة
    return () => clearTimeout(delayDebounce);
  }, [text, onSearchChange]);

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)} // تحديث فوري وسلس للكتابة بدون Lag
        placeholder="أدخل نص البحث (اسم، رقم جلوس، كود)..."
        style={{
          width: '95%',
          padding: '14px',
          borderRadius: '8px',
          border: '2px solid #00A3FF',
          backgroundColor: '#0B1B3D',
          color: '#FFF',
          fontSize: '16px',
          textAlign: 'right',
          outline: 'none'
        }}
      />
    </div>
  );
};
