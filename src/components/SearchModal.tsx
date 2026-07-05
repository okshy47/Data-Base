import React, { useState, useEffect } from 'react';
import { Logo, LogoTheme } from './Logo';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: LogoTheme;
  onSearch: (query: string) => void;
  searchResults: any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSearch,
  searchResults
}) => {
  const [localQuery, setLocalQuery] = useState('');

  // ميكانيزم الـ Debounce لمنع الـ Lag أثناء الكتابة السريعة
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(localQuery);
    }, 300); // الانتظار 300 مللي ثانية قبل بدء البحث الخلفي

    return () => clearTimeout(handler);
  }, [localQuery, onSearch]);

  if (!isOpen) return null;

  // تنسيق الألوان المتوافق ديناميكياً مع الأوضاع الخمسة للوجو واجهة التطبيق
  const themeStyles = {
    'dark-blue': { bg: '#030F26', modalBg: '#0B1B3D', text: '#FFFFFF', border: '#00A3FF', inputBg: '#030F26' },
    'light':     { bg: '#F4F6F9', modalBg: '#FFFFFF', text: '#0B1B3D', border: '#0B1B3D', inputBg: '#F4F6F9' },
    'emerald':   { bg: '#0A1C16', modalBg: '#112E24', text: '#FFFFFF', border: '#00E5A3', inputBg: '#0A1C16' },
    'charcoal':  { bg: '#12161A', modalBg: '#1C232B', text: '#FFFFFF', border: '#D4AF37', inputBg: '#12161A' },
    'digital':   { bg: '#0D1127', modalBg: '#171E3D', text: '#FFFFFF', border: '#A855F7', inputBg: '#0D1127' }
  };

  const current = themeStyles[theme] || themeStyles['dark-blue'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: current.modalBg,
        width: '100%',
        maxWidth: '600px',
        borderRadius: '16px',
        border: `2px solid ${current.border}`,
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        {/* زر الإغلاق العلوي */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          color: current.text,
          fontSize: '20px',
          cursor: 'pointer',
          opacity: 0.7
        }}>✕</button>

        {/* وضع اللوجو المطور مدمجاً في المنتصف فوق خانة البحث ليعطي مظهر فخم */}
        <div style={{ marginBottom: '20px' }}>
          <Logo theme={theme} size={130} showText={true} />
        </div>

        {/* خانة البحث الذكية مع معالجة الـ RTL وتفادي تداخل نصوص الكتابة مع أيقونة العدسة */}
        <div style={{ width: '100%', position: 'relative', direction: 'rtl' }}>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="ابحث برقم الجلوس، الاسم، أو المادة..."
            style={{
              width: '100%',
              padding: '14px 45px 14px 20px', // حشوة من اليمين لتفادي التداخل تماماً مع أيقونة العدسة
              fontSize: '16px',
              borderRadius: '12px',
              border: `2px solid ${current.border}`,
              backgroundColor: current.inputBg,
              color: current.text,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
          />
          
          {/* أيقونة عدسة البحث مثبتة في جهة اليمين بدقة هندسية */}
          <div style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={current.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* منطقة عرض نتائج الاستعلام والبحث الفوري السريع */}
        <div style={{
          width: '100%',
          marginTop: '20px',
          maxHeight: '250px',
          overflowY: 'auto',
          direction: 'rtl'
        }}>
          {localQuery && searchResults.length === 0 && (
            <p style={{ color: current.text, textAlign: 'center', fontSize: '14px', opacity: 0.7 }}>لا توجد نتائج مطابقة لبحثك</p>
          )}
          {searchResults.map((result, index) => (
            <div key={index} style={{
              padding: '12px',
              borderBottom: `1px solid ${current.border}33`,
              color: current.text,
              fontSize: '14px',
              textAlign: 'right',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${current.border}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* هنا سيتم عرض نص النتيجة بناءً على طبيعة شيتات الإكسيل لديك */}
              {result.name || result.text || JSON.stringify(result)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
