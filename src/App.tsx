import React, { useState, useMemo, useCallback } from 'react';
import { Logo, LogoTheme } from './components/Logo';
import { ThemeToggle } from './components/ThemeToggle';
import { SearchModal } from './components/SearchModal';
import { PrintReport } from './components/PrintReport';

export default function App() {
  // 1. إدارة حالات المظهر (Theme) والأوضاع الخمسة
  const [currentTheme, setCurrentTheme] = useState<LogoTheme>('dark-blue');
  
  // 2. إدارة حالات البيانات والتصفية ثلاثية الأبعاد (ملف، شيت، عمود)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // بيانات تجريبية تحاكي شيتات الكنترول وقواعد البيانات الضخمة المستوردة
  const [databasePayload] = useState<any[]>([
    { 'رقم الجلوس': '1025', 'الاسم': 'أحمد محمد علي', 'المادة': 'حوكمة وتحول رقمي', 'الدرجة': '95', 'التقدير': 'امتياز' },
    { 'رقم الجلوس': '1026', 'الاسم': 'محمود حسين أحمد', 'المادة': 'إدارة العمليات واللوجستيات', 'الدرجة': '88', 'التقدير': 'جيد جداً' },
    { 'رقم الجلوس': '1027', 'الاسم': 'سارة عبد الرحمن', 'المادة': 'تحليل البيانات المتقدم', 'الدرجة': '92', 'التقدير': 'امتياز' },
  ]);

  // دالة الفلترة الفورية السريعة للبحث الشامل والمحمية بـ UseMemo لمنع الـ Lag
  const filteredResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    return databasePayload.filter((row) => 
      Object.values(row).some((val) => 
        String(val).toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    );
  }, [globalSearchQuery, databasePayload]);

  const handleSearchCommit = useCallback((query: string) => {
    setGlobalSearchQuery(query);
  }, []);

  // إعداد مصفوفة الألوان المتطابقة مع الواجهة الرئيسية للأوضاع الخمسة
  const themeStyles = {
    'dark-blue': { bg: '#030F26', cardBg: '#0B1B3D', text: '#FFFFFF', accent: '#00A3FF' },
    'light':     { bg: '#F4F6F9', cardBg: '#FFFFFF', text: '#0B1B3D', accent: '#1E3A8A' },
    'emerald':   { bg: '#0A1C16', cardBg: '#112E24', text: '#FFFFFF', accent: '#00E5A3' },
    'charcoal':  { bg: '#12161A', cardBg: '#1C232B', text: '#FFFFFF', accent: '#D4AF37' },
    'digital':   { bg: '#0D1127', cardBg: '#171E3D', text: '#FFFFFF', accent: '#A855F7' }
  };

  const currentStyle = themeStyles[currentTheme] || themeStyles['dark-blue'];

  return (
    <div style={{
      backgroundColor: currentStyle.bg,
      minHeight: '100vh',
      color: currentStyle.text,
      transition: 'all 0.5s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* الشريط العلوي للتحكم في المظهر (Theme) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '30px' }}>
        <ThemeToggle currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      </div>

      {/* الواجهة الرئيسية للتطبيق المحسنة هندسياً باللوجو المطور */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '40px',
        gap: '20px'
      }}>
        {/* اللوجو مدمجاً بجانب عنوان "المستكشف" ليعطي مظهراً فخماً ورسمياً */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: 'row-reverse' }}>
          <Logo theme={currentTheme} size={90} showText={false} />
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>مستكشف قواعد البيانات الذكي</h1>
        </div>

        <p style={{ opacity: 0.8, fontSize: '15px', direction: 'rtl', textAlign: 'center' }}>
          نظام الإدارة والتحكم الذكي بالإحصائيات والبحث ثلاثي الأبعاد في ملفات الكنترول وقواعد البيانات.
        </p>

        {/* زر تفعيل وإطلاق نافذة البحث الشامل الذكي */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          style={{
            backgroundColor: currentStyle.accent,
            color: currentTheme === 'light' && currentStyle.accent === '#1E3A8A' ? '#FFF' : '#000',
            border: 'none',
            padding: '14px 28px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
            direction: 'rtl'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔍 افتح نافذة المستكشف الشامل
        </button>
      </div>

      {/* نافذة البحث المنبثقة (Modal) المعزولة والمحسنة */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        theme={currentTheme}
        onSearch={handleSearchCommit}
        searchResults={filteredResults}
      />

      {/* محرك ومكون تقارير الطباعة المنسق لورق A4 */}
      <PrintReport data={databasePayload} title="تقرير نتائج مستكشف الكنترول العام" />

    </div>
  );
}
