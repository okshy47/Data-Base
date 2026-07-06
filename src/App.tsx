import React, { useState } from 'react';
import Logo from './components/Logo';
import SearchScreen from './SearchScreen';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('dark-blue');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div style={{ 
      backgroundColor: '#030F26', 
      minHeight: '100vh', 
      margin: 0, 
      padding: '20px',
      color: '#FFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl',
      boxSizing: 'border-box'
    }}>
      {/* شريط التحكم في المظهر والألوان */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => setCurrentTheme(currentTheme === 'dark-blue' ? 'light' : 'dark-blue')}
          style={{ padding: '8px 16px', backgroundColor: '#00A3FF', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}
        >
          تبديل مظهر اللوحة
        </button>
      </div>

      {/* الواجهة الرئيسية والمستكشف الذكي */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '40px', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: 'row-reverse' }}>
          <Logo theme={currentTheme} size={90} showText={false} />
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>مستكشف قواعد البيانات الذكي</h1>
        </div>
        
        <p style={{ opacity: 0.8, fontSize: '15px', textAlign: 'center', maxWidth: '600px' }}>
          نظام الإدارة والتحكم الذكي بالإحصاءات والبحث الفوري في ملفات الكنترول وقواعد البيانات المختلفة.
        </p>

        {/* زر تفعيل واجهة البحث المنبثقة */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          style={{
            backgroundColor: '#00A3FF',
            border: 'none',
            padding: '14px 28px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '12px',
            cursor: 'pointer',
            color: '#000',
            marginTop: '10px'
          }}
        >
          افتح نافذة المستكشف الشامل ←
        </button>
      </div>

      {/* شاشة البحث المدعومة بالكامل وتظهر فوق الواجهة عند تفعيلها */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: '#030F26',
          overflowY: 'auto',
          padding: '30px'
        }}>
          <button 
            onClick={() => setIsSearchOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              padding: '10px 20px',
              backgroundColor: '#FF3B30',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            إغلاق المستكشف ×
          </button>
          
          <div style={{ marginTop: '60px' }}>
            <SearchScreen />
          </div>
        </div>
      )}
    </div>
  );
}