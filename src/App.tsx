import React, { useState } from 'react';

// الترجمات الأساسية لمنع الانهيار
const translations = {
  ar: { title: "نظام إدارة قواعد البيانات والكنترول", globalSearch: "البحث الشامل", searchPlaceholder: "ابحث هنا...", close: "إغلاق", maximize: "تكبير", minimize: "تصغير" }
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h1>{translations.ar.title}</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {translations.ar.globalSearch}
        </button>
      </header>

      <main style={{ marginTop: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <p>مرحباً بك في لوحة التحكم. اضغط على زر البحث الشامل لتجربة النظام المطور.</p>
      </main>

      {/* النافذة المنبثقة الذكية للبحث الشامل - حل جذري لـ Maximize والشاشة السوداء */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{
            background: '#1e293b',
            borderRadius: isMaximized ? '0px' : '12px',
            width: isMaximized ? '100vw' : '85vw',
            height: isMaximized ? '100vh' : '80vh',
            maxWidth: isMaximized ? '100vw' : '800px',
            maxHeight: isMaximized ? '100vh' : '600px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            {/* شريط التحكم العلوي */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{translations.ar.globalSearch}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  {isMaximized ? translations.ar.minimize : translations.ar.maximize}
                </button>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  {translations.ar.close}
                </button>
              </div>
            </div>

            {/* صندوق البحث */}
            <input 
              type="text" 
              placeholder={translations.ar.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />

            <div style={{ flex: 1, marginTop: '20px', overflowY: 'auto', color: '#94a3b8', textAlign: 'center' }}>
              {searchQuery ? `نتائج البحث عن: ${searchQuery}` : "ابدأ الكتابة للبحث في مؤشرات الكنترول..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
