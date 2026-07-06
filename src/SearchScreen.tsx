import React, { useState, useTransition } from 'react';
import SearchInput from './components/SearchInput';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    // استخدام الـ Transition لفصل تحديث الواجهة عن عمليات الفرز الثقيلة
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  return (
    <div style={{ padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'right' }}>البحث الشامل</h2>
      
      {/* استدعاء مكون الإدخال الذكي المعالج للـ Lag */}
      <SearchInput onSearch={handleSearch} />

      {isPending && <p style={{ textAlign: 'center', color: '#38BDF8' }}>جاري الفرز الفوري...</p>}

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