import React from 'react';

// تعريف أنواع الأوضاع الخمسة المتوافقة مع هوية التطبيق
export type LogoTheme = 'dark-blue' | 'light' | 'emerald' | 'charcoal' | 'digital';

interface LogoProps {
  theme: LogoTheme;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ theme, size = 200, showText = true }) => {
  // إعداد مصفوفة الألوان والتدرجات بناءً على التصميم المقترح تماماً
  const themeStyles = {
    'dark-blue': {
      bg: '#030F26',          // الوضع الليلي الفاخر
      magnifier: '#00A3FF',    // أزرق نيون مضيء
      folder: '#0055FF',       // أزرق غامق للمجلد
      files: '#E0F0FF',        // أوراق بيضاء مائلة للزرقة
      textMain: '#FFFFFF',     // اسم التطبيق بالأبيض
      textSub: '#00A3FF',      // النص الفرعي بالأزرق المضيء
      speedLines: '#00A3FF'
    },
    'light': {
      bg: '#F4F6F9',          // الوضع المضيء النقي
      magnifier: '#0B1B3D',    // كحلي داكن جداً للمكبر ليعطي تباين قوي
      folder: '#1E3A8A',       // مجلد أزرق ملكي
      files: '#FFFFFF',        // أوراق بيضاء
      textMain: '#0B1B3D',     // اسم التطبيق كحلي
      textSub: '#1E3A8A',      // النص الفرعي أزرق
      speedLines: '#0B1B3D'
    },
    'emerald': {
      bg: '#0A1C16',          // الوضع الزمردي
      magnifier: '#00E5A3',    // أخضر زمردي مضيء
      folder: '#059669',       // مجلد أخضر غامق
      files: '#D1FAE5',        // أوراق خخضراء فاتحة جداً
      textMain: '#FFFFFF',     // اسم التطبيق أبيض
      textSub: '#00E5A3',      // النص الفرعي زمردي
      speedLines: '#00E5A3'
    },
    'charcoal': {
      bg: '#12161A',          // المظهر الكلاسيكي الفخم
      magnifier: '#D4AF37',    // ذهبي فخم
      folder: '#B45309',       // مجلد برونزي/نحاسي غامق
      files: '#FEF3C7',        // أوراق عاجية كريمية
      textMain: '#FFFFFF',     // اسم التطبيق أبيض
      textSub: '#D4AF37',      // النص الفرعي ذهبي
      speedLines: '#D4AF37'
    },
    'digital': {
      bg: '#0D1127',          // الوضع الحديث الرقمي
      magnifier: 'url(#digitalGradient)', // تدرج بنفسجي وأزرق مضيء
      folder: '#2563EB',       // مجلد أزرق رقمي
      files: '#F3F4F6',        // أوراق رمادية فاتحة
      textMain: '#FFFFFF',     // اسم التطبيق أبيض
      textSub: '#A855F7',      // النص الفرعي بنفسجي
      speedLines: '#6366F1'
    }
  };

  const current = themeStyles[theme] || themeStyles['dark-blue'];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      backgroundColor: current.bg, 
      padding: '20px', 
      borderRadius: '16px',
      transition: 'all 0.5s ease', // تأثير انسيابي ناعم جداً عند تغيير الألوان
      width: 'fit-content'
    }}>
      {/* رسم اللوجو الهندسي بالـ SVG ليحافظ على دقته وبدون استخدام صور خارجية */}
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* التدرج اللوني الخاص بالوضع الرقمي الخامس */}
          <linearGradient id="digitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#00A3FF" />
          </linearGradient>
          {/* تأثير توهج نيون خفيف خلف المكبر للأوضاع المضيئة */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* خطوط اندفاع البيانات السريعة جهة اليسار */}
        <g stroke={current.speedLines} strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <line x1="20" y1="85" x2="45" y2="85" />
          <line x1="15" y1="100" x2="40" y2="100" />
          <line x1="25" y1="115" x2="50" y2="115" />
        </g>

        {/* Mالمجلد والأوراق في المنتصف */}
        <g id="FolderAndFiles">
          {/* الورقة الخلفية المستندية المائلة */}
          <rect x="85" y="60" width="35" height="45" rx="3" transform="rotate(5 102.5 82.5)" fill={current.files} />
          <line x1="93" y1="70" x2="110" y2="72" stroke="#9CA3AF" strokeWidth="2" />
          <line x1="93" y1="80" x2="107" y2="81" stroke="#9CA3AF" strokeWidth="2" />
          
          {/* جسم المجلد الأمامي */}
          <path d="M70 80C70 77.7909 71.7909 76 74 76H90L96 82H126C128.209 82 130 83.7909 130 86V120C130 122.209 128.209 124 126 124H74C71.7909 124 70 122.209 70 120V80Z" fill={current.folder} />
        </g>

        {/* عدسة المكبر الذكي المحيطة بالمجلد ومقبضها */}
        <g id="Magnifier">
          {/* مقبض المكبر المائل بزاوية 45 درجة في الأسفل اليمين */}
          <line x1="135" y1="135" x2="165" y2="165" stroke={current.magnifier} strokeWidth="12" strokeLinecap="round" />
          {/* حلقة المكبر الدائرية الأساسية مع تأثير التوهج الفاخر */}
          <circle cx="100" cy="100" r="45" stroke={current.magnifier} strokeWidth="7" filter={theme !== 'light' ? 'url(#glow)' : ''} />
        </g>
      </svg>

      {/* النصوص المرافقة للوجو بالخط العربي الأنيق */}
      {showText && (
        <div style={{ textAlign: 'center', marginTop: '15px', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>
          <h1 style={{ 
            color: current.textMain, 
            margin: '0', 
            fontSize: '24px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            المستكشف
          </h1>
          <p style={{ 
            color: current.textSub, 
            margin: '5px 0 0 0', 
            fontSize: '12px',
            opacity: 0.85
          }}>
            اكتشف بياناتك بذكاء وسرعة
          </p>
        </div>
      )}
    </div>
  );
};
