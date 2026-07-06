import React, { useState, useTransition } from 'react';
// استيراد مكون البحث من ملف اللوجو الذي يحتوي على الكود حالياً لحل مشكلة الملف المفقود
import SearchInput from './components/Logo';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    // فصل تصفية البيانات في الخلفية لمنع الـ Lag تماماً
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  return (
    <div style={{ padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'right', color: '#00A3FF' }}>المستكشف الشامل لقواعد البيانات</h2>
      
      {/* استدعاء مكون البحث الذكي المانع للتعليق */}
      <SearchInput onSearch={handleSearch} placeholder="ابدأ الكتابة للبحث الفوري..." />

      {isPending && <p style={{ textAlign: 'center', color: '#38BDF8' }}>جاري فرز وتحديث البيانات...</p>}

      <div style={{ marginTop: '20px' }}>
        {searchQuery && (
          <p style={{ textAlign: 'right', color: '#94A3B8' }}>
            نتائج البحث عن: <span style={{ color: '#F43F5E' }}>{searchQuery}</span>
          </p>
        )}
      </div>
    </div>
  );
}