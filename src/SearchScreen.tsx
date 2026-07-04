import React, { useState } from 'react';
import { Logo, LogoTheme } from './Logo';

export const SearchScreen: React.FC = () => {
  // 1. تحديد حالة الوضع الحالي (الافتراضي هو الوضع الليلي الفاخر)
  const [currentTheme, setCurrentTheme] = useState<LogoTheme>('dark-blue');
  const [searchQuery, setSearchQuery] = useState('');

  // 2. إعداد ألوان خلفيات ونصوص الشاشة لتتناسب تماماً مع لوجو الأوضاع الخمسة
  const themeStyles = {
    'dark-blue': { bg: '#030F26', inputBg: '#0B1B3D', inputText: '#FFFFFF', inputBorder: '#00A3FF', placeholder: '#9CA3AF' },
    'light':     { bg: '#F4F6F9', inputBg: '#FFFFFF', inputText: '#0B1B3D', inputBorder: '#0B1B3D', placeholder: '#6B7280' },
    'emerald':   { bg: '#0A1C16', inputBg: '#112E24', inputText: '#FFFFFF', inputBorder: '#00E5A3', placeholder: '#6EE7B7' },
    'charcoal':  { bg: '#12161A', inputBg: '#1C232B', inputText: '#FFFFFF', inputBorder: '#D4AF37', placeholder: '#FCD34D' },
    'digital':   { bg: '#0D1127', inputBg: '#171E3D', inputText: '#FFFFFF', inputBorder: '#A855F7', placeholder: '#C084FC' }
  };

  const currentStyle = themeStyles[currentTheme];

  return (
    <div style={{
      backgroundColor: currentStyle.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      transition: 'all 0.5s ease', // انتقال ناعم جداً للألوان عند التبديل
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      
      {/* شريط علوي صغير لاختيار وتجربة الأوضاع الخمسة */}
      <div style={{
        position: 'absolute',
        top: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        padding: '10px 20px',
        borderRadius: '30px',
        backdropFilter: 'blur(5px)'
      }}>
        <span style={{ color: currentTheme === 'light' ? '#0B1B3D' : '#FFF', fontSize: '12px', direction: 'rtl', marginLeft: '5px' }}>
          مظهر التطبيق:
        </span>
        {/* الأزرار الدائرية الملونة المستوحاة من صورتك المقترحة */}
        <button onClick={() => setCurrentTheme('dark-blue')} title="Deep Dark Blue" style={{ width: '20px', height: '20px', borderRadius: '50%', border: currentTheme === 'dark-blue' ? '2px solid #FFF' : 'none', background: '#030F26', cursor: 'pointer' }} />
        <button onClick={() => setCurrentTheme('light')} title="Clean Slate Light" style={{ width: '20px', height: '20px', borderRadius: '50%', border: currentTheme === 'light' ? '2px solid #000' : 'none', background: '#F4F6F9', cursor: 'pointer' }} />
        <button onClick={() => setCurrentTheme('emerald')} title="Emerald Professional" style={{ width: '20px', height: '20px', borderRadius: '50%', border: currentTheme === 'emerald' ? '2px solid #FFF' : 'none', background: '#00E5A3', cursor: 'pointer' }} />
        <button onClick={() => setCurrentTheme('charcoal')} title="Luxury Charcoal" style={{ width: '20px', height: '20px', borderRadius: '50%', border: currentTheme === 'charcoal' ? '2px solid #FFF' : 'none', background: '#D4AF37', cursor: 'pointer' }} />
        <button onClick={() => setCurrentTheme('digital')} title="Digital Fusion" style={{ width: '20px', height: '20px', borderRadius: '50%', border: currentTheme === 'digital' ? '2px solid #FFF' : 'none', background: 'linear-gradient(45deg, #A855F7, #00A3FF)', cursor: 'pointer' }} />
      </div>

      {/* قسم اللوجو مدمجاً في المنتصف بدقة */}
      <div style={{ marginBottom: '30px' }}>
        <Logo theme={currentTheme} size={180} showText={true} />
      </div>

      {/* شريط خانة البحث الذكي مواءم تماماً مع الهوية الجديدة ومعدل الـ RTL */}
      <div style={{
        width: '100%',
        maxWidth: '550px',
        position: 'relative',
        direction: 'rtl'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في قاعدة البيانات برقم الجلوس، الاسم، أو المادة..."
          style={{
            width: '100%',
            padding: '14px 45px 14px 20px', // حشوة من اليمين لتفادي التداخل مع عدسة البحث
            fontSize: '16px',
            borderRadius: '12px',
            border: `2px solid ${currentStyle.inputBorder}`,
            backgroundColor: currentStyle.inputBg,
            color: currentStyle.inputText,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
        
        {/* أيقونة عدسة البحث مثبتة في جهة اليمين لتفادي تداخل نصوص الكتابة معها */}
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={currentStyle.inputBorder} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

    </div>
  );
};
