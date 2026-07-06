import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- مكون اللوجو المدمج لحل مشكلة المسارات تماماً ---
export type LogoTheme = 'dark-blue' | 'light' | 'emerald' | 'charcoal' | 'digital';

interface LogoProps {
  theme: LogoTheme;
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ theme, size = 120, showText = true }) => {
  const themes = {
    'dark-blue': { primary: '#00A3FF', secondary: '#00E5A3', text: '#FFFFFF' },
    'light':     { primary: '#0B1B3D', secondary: '#00A3FF', text: '#0B1B3D' },
    'emerald':   { primary: '#00E5A3', secondary: '#A855F7', text: '#FFFFFF' },
    'charcoal':  { primary: '#D4AF37', secondary: '#1C232B', text: '#FFFFFF' },
    'digital':   { primary: '#A855F7', secondary: '#FF007A', text: '#FFFFFF' }
  };

  const colors = themes[theme] || themes['dark-blue'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' }}>
        <circle cx="50" cy="50" r="45" stroke={colors.primary} strokeWidth="3" fill="none" strokeDasharray="6 6" />
        <circle cx="50" cy="50" r="35" stroke={colors.secondary} strokeWidth="1.5" fill="none" />
        <path d="M35 50 L45 60 L65 40" stroke={colors.primary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="65" cy="40" r="3" fill={colors.secondary} />
      </svg>
      {showText && (
        <span style={{ color: colors.text, fontSize: `${size * 0.15}px`, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          المستكشف الذكي
        </span>
      )}
    </div>
  );
};

// --- مكون المودال المدمج لضمان أعلى توافق ---
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: LogoTheme;
  onSearch: (query: string) => void;
  searchResults: any[];
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, theme, onSearch, searchResults }) => {
  const [localQuery, setLocalQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => { onSearch(localQuery); }, 300);
    return () => clearTimeout(handler);
  }, [localQuery, onSearch]);

  if (!isOpen) return null;

  const themeStyles = {
    'dark-blue': { bg: '#030F26', modalBg: '#0B1B3D', text: '#FFFFFF', border: '#00A3FF', inputBg: '#030F26' },
    'light':     { bg: '#F4F6F9', modalBg: '#FFFFFF', text: '#0B1B3D', border: '#0B1B3D', inputBg: '#F4F6F9' },
    'emerald':   { bg: '#0A1C16', modalBg: '#112E24', text: '#FFFFFF', border: '#00E5A3', inputBg: '#0A1C16' },
    'charcoal':  { bg: '#12161A', modalBg: '#1C232B', text: '#FFFFFF', border: '#D4AF37', inputBg: '#12161A' },
    'digital':   { bg: '#0D1127', modalBg: '#171E3D', text: '#FFFFFF', border: '#A855F7', inputBg: '#0D1127' }
  };

  const current = themeStyles[theme] || themeStyles['dark-blue'];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
      <div style={{ backgroundColor: current.modalBg, width: '100%', maxWidth: '600px', borderRadius: '16px', border: `2px solid ${current.border}`, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: current.text, fontSize: '20px', cursor: 'pointer', opacity: 0.7 }}>✕</button>
        <div style={{ marginBottom: '20px' }}>
          <Logo theme={theme} size={130} showText={true} />
        </div>
        <div style={{ width: '100%', position: 'relative', direction: 'rtl' }}>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="ابحث برقم الجلوس، الاسم، أو المادة..."
            style={{ width: '100%', padding: '14px 45px 14px 20px', fontSize: '16px', borderRadius: '12px', border: `2px solid ${current.border}`, backgroundColor: current.inputBg, color: current.text, outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={current.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '20px', maxHeight: '250px', overflowY: 'auto', direction: 'rtl' }}>
          {localQuery && searchResults.length === 0 && (
            <p style={{ color: current.text, textAlign: 'center', fontSize: '14px', opacity: 0.7 }}>لا توجد نتائج مطابقة لبحثك</p>
          )}
          {searchResults.map((result, index) => (
            <div key={index} style={{ padding: '12px', borderBottom: `1px solid ${current.border}33`, color: current.text, fontSize: '14px', textAlign: 'right' }}>
              {result['الاسم'] ? (
                <div>
                  <strong>{result['الاسم']}</strong> - {result['المادة']} 
                  <span style={{ color: current.border, marginRight: '10px' }}>(التقدير: {result['التقدير']})</span>
                </div>
              ) : JSON.stringify(result)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي للشاشة ---
export const SearchScreen: React.FC = () => {
  const [theme, setTheme] = useState<LogoTheme>('dark-blue');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [mockDatabase] = useState<any[]>([
    { 'رقم الجلوس': '1025', 'الاسم': 'أحمد محمد علي', 'المادة': 'حوكمة وتحول رقمي', 'الدرجة': '95', 'التقدير': 'امتياز' },
    { 'رقم الجلوس': '1026', 'الاسم': 'محمود حسين أحمد', 'المادة': 'إدارة العمليات واللوجستيات', 'الدرجة': '88', 'التقدير': 'جيد جداً' },
    { 'رقم الجلوس': '1027', 'الاسم': 'سارة عبد الرحمن', 'المادة': 'تحليل البيانات المتقدم', 'الدرجة': '92', 'التقدير': 'امتياز' },
  ]);

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

  const backgroundStyles = {
    'dark-blue': '#030F26',
    'light':     '#F4F6F9',
    'emerald':   '#0A1C16',
    'charcoal':  '#12161A',
    'digital':   '#0D1127'
  };

  return (
    <div style={{ backgroundColor: backgroundStyles[theme] || backgroundStyles['dark-blue'], minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', padding: '20px', boxSizing: 'border-box', transition: 'all 0.5s ease', justifyContent: 'center' }}>
      <div style={{ marginBottom: '30px', direction: 'rtl' }}>
        <select value={theme} onChange={(e) => setTheme(e.target.value as LogoTheme)} style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>
          <option value="dark-blue">الأزرق الداكن</option>
          <option value="light">المظهر المضيء</option>
          <option value="emerald">الزمردي الرقمي</option>
          <option value="charcoal">الفحمي الذهبي</option>
          <option value="digital">البنفسجي الحديث</option>
        </select>
      </div>

      <button onClick={() => setIsModalOpen(true)} style={{ padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '12px', border: 'none', backgroundColor: '#00A3FF', color: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
        🔍 تشغيل مستكشف الكنترول الذكي
      </button>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} theme={theme} onSearch={handleSearch} searchResults={filteredResults} />
    </div>
  );
};
