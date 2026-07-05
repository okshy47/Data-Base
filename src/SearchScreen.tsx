import React, { useState, useMemo, useCallback } from 'react';
import { Logo, LogoTheme } from './components/Logo';
import { SearchModal } from './components/SearchModal';

export const SearchScreen: React.FC = () => {
  const [theme, setTheme] = useState<LogoTheme>('dark-blue');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // قاعدة البيانات الافتراضية للكنترول ورصد الدرجات لضمان عدم وجود تفاصيل ناقصة أثناء الـ Build
  const [mockDatabase] = useState<any[]>([
    { 'رقم الجلوس': '1025', 'الاسم': 'أحمد محمد علي', 'المادة': 'حوكمة وتحول رقمي', 'الدرجة': '95', 'التقدير': 'امتياز' },
    { 'رقم الجلوس': '1026', 'الاسم': 'محمود حسين أحمد', 'المادة': 'إدارة العمليات واللوجستيات', 'الدرجة': '88', 'التقدير': 'جيد جداً' },
    { 'رقم الجلوس': '1027', 'الاسم': 'سارة عبد الرحمن', 'المادة': 'تحليل البيانات المتقدم', 'الدرجة': '92', 'التقدير': 'امتياز' },
  ]);

  // تصفية البيانات الفورية بناءً على قيمة استعلام البحث
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mockDatabase.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, mockDatabase]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // تنسيق الألوان الخاص بالخلفية ليتماشى مع اختيار المظهر المتغير
  const backgroundStyles = {
    'dark-blue': '#030F26',
    'light':     '#F4F6F9',
    'emerald':   '#0A1C16',
    'charcoal':  '#12161A',
    'digital':   '#0D1127'
  };

  return (
    <div style={{
      backgroundColor: backgroundStyles[theme] || backgroundStyles['dark-blue'],
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      transition: 'all 0.5s ease'
    }}>
      {/* وحدة التحكم في المظهر العلوي للشاشة */}
      <div style={{ marginBottom: '30px', direction: 'rtl' }}>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value as LogoTheme)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="dark-blue">الأزرق الداكن</option>
          <option value="light">المظهر المضيء</option>
          <option value="emerald">الزمردي الرقمي</option>
          <option value="charcoal">الفحمي الذهبي</option>
          <option value="digital">البنفسجي الحديث</option>
        </select>
      </div>

      {/* زر تشغيل شاشة البحث الفوري المستكشف */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: '#00A3FF',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔍 تشغيل مستكشف الكنترول الذكي
      </button>

      {/* استدعاء المودال برابط الخصائص الصحيح والمتطابق 100% */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
        onSearch={handleSearch}
        searchResults={filteredResults}
      />
    </div>
  );
};
