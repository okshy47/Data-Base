import React, { useState, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, placeholder }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // آلية تأخير الاستجابة (Debounce) لمنع الـ Lag أثناء الكتابة السريعة
    const timer = setTimeout(() => {
      onSearch(text);
    }, 400); // انتظام البحث بعد 400 ملي ثانية من التوقف عن الكتابة

    return () => clearTimeout(timer);
  }, [text, onSearch]);

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder || "اكتب هنا للبحث السريع..."}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #1E293B',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
  );
};

export default SearchInput;