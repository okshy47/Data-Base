import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. نظام الترجمة (i18n) المتكامل
// ==========================================
const translations: Record<string, any> = {
  ar: {
    title: "نظام إدارة قواعد البيانات والكنترول",
    langToggle: "English",
    themeLight: "الوضع المضيء",
    themeDark: "الوضع الداكن",
    online: "متصل",
    offline: "غير متصل",
    importDb: "استيراد قاعدة بيانات",
    globalSearch: "البحث الشامل",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للبحث",
    savedDbs: "قواعد البيانات المحفوظة للكنترول",
    loading: "جاري التحميل...",
    noDbs: "لا توجد قواعد بيانات حالياً",
    noDbsSub: "قم برفع ملفاتك البدء في إدارتها وفحص مؤشرات الكنترول.",
    tables: "جداول",
    rows: "صفوف",
    storageStatus: "حالة المساحة التخزينية",
    persistentStorage: "التخزين الدائم",
    storageSupported: "مدعوم",
    storageEnabled: "مفعّل",
    enableStorage: "تفعيل التخزين الدائم",
    usedSpace: "المساحة المستخدمة",
    deleteConfirm: "هل أنت متأكد من حذف قاعدة البيانات هذه؟",
    searchPlaceholder: "ابحث في جميع قواعد البيانات، الجداول، والأعمدة...",
    allDbs: "جميع قواعد البيانات",
    allTables: "جميع الجداول",
    allColumns: "جميع الأعمدة",
    searchStart: "اكتب كلمة البحث للبدء في فحص البيانات...",
    searching: "جاري البحث...",
    noResults: "لا توجد نتائج مطابقة",
    noResultsSub: "جرّب كلمات مفتاحية أخرى أو غيّر فلاتر البحث.",
    resultsCount: "نتيجة مطابقة",
    truncated: " (تم عرض جزء من النتائج)",
    prev: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
    maximize: "ملء الشاشة",
    minimize: "تصغير الشاشة"
  },
  en: {
    title: "Database & Control Management System",
    langToggle: "العربية",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    online: "Online",
    offline: "Offline",
    importDb: "Import Database",
    globalSearch: "Global Search",
    importFirst: "Please import a database first to search",
    savedDbs: "Saved Databases",
    loading: "Loading...",
    noDbs: "No Databases",
    noDbsSub: "Upload your files to start managing and inspecting them.",
    tables: "tables",
    rows: "rows",
    storageStatus: "Storage Status",
    persistentStorage: "Persistent Storage",
    storageSupported: "Supported",
    storageEnabled: "Enabled",
    enableStorage: "Enable Persistent Storage",
    usedSpace: "Used Space",
    deleteConfirm: "Are you sure you want to delete this database?",
    searchPlaceholder: "Search across all databases and tables...",
    allDbs: "All Databases",
    allTables: "All Tables",
    allColumns: "All Columns",
    searchStart: "Type to start searching...",
    searching: "Searching...",
    noResults: "No results found",
    noResultsSub: "Try different keywords or adjust your filters.",
    resultsCount: "matching results",
    truncated: " (results truncated)",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    maximize: "Maximize",
    minimize: "Restore"
  }
};

// ==========================================
// 2. المكون الرئيسي للتطبيق (App)
// ==========================================
export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // فلاتر البحث الشامل
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');

  const t = useMemo(() => translations[lang], [lang]);

  // تبديل اللغة وحفظها
  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  return (
    <div style={{
      padding: '20px',
      background: isDarkMode ? '#0f172a' : '#f8fafc',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      transition: 'all 0.3s ease'
    }}>
      
      {/* ---------- شريط التنقل العلوي الرئيسي ---------- */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#cbd5e1'}`,
        paddingBottom: '15px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', margin: 0 }}>{t.title}</h1>
          <span style={{
            fontSize: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {t.online}
          </span>
        </div>

        {/* أزرار التحكم في النظام */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {t.globalSearch}
          </button>
          <button style={{ padding: '10px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {t.importDb}
          </button>
          <button onClick={toggleLanguage} style={{ padding: '10px 14px', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {t.langToggle}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px 14px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {isDarkMode ? t.themeLight : t.themeDark}
          </button>
        </div>
      </header>

      {/* ---------- محتوى اللوحة الرئيسي (قواعد البيانات المحفوظة) ---------- */}
      <main style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>{t.savedDbs}</h2>
        
        {/* صندوق عرض توضيحي لقواعد البيانات المستوردة لمنع الفراغ */}
        <div style={{
          background: isDarkMode ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#3b82f6' }}>قاعدة_بيانات_مؤشرات_الكنترول_ماجستير_تسويق</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>3 {t.tables} | 145 {t.rows}</p>
            </div>
            <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              حذف
            </button>
          </div>
        </div>

        {/* قسم حالة المساحة التخزينية */}
        <section style={{ marginTop: '40px', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '20px' }}>
          <h3>{t.storageStatus}</h3>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#94a3b8' }}>
            <div>{t.persistentStorage}: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{t.storageEnabled}</span></div>
            <div>{t.usedSpace}: <span style={{ color: isDarkMode ? '#fff' : '#000' }}>0.45 MB</span></div>
          </div>
        </section>
      </main>

      {/* ---------- 3. نافذة البحث الشامل الذكية والمطورة ---------- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, padding: isMaximized ? 0 : '20px'
        }}>
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            borderRadius: isMaximized ? '0px' : '12px',
            width: isMaximized ? '100vw' : '90vw',
            height: isMaximized ? '100vh' : '85vh',
            maxWidth: isMaximized ? '100vw' : '900px',
            maxHeight: isMaximized ? '100vh' : '650px',
            transition: 'all 0.2s ease-in-out',
            display: 'flex', flexDirection: 'column',
            padding: '20px', boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* شريط تحكم النافذة */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              paddingBottom: '12px', marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{t.globalSearch}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  style={{ background: isDarkMode ? '#475569' : '#cbd5e1', color: isDarkMode ? '#fff' : '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {isMaximized ? t.minimize : t.maximize}
                </button>
                <button 
                  onClick={() => { setIsModalOpen(false); setIsMaximized(false); }}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>

            {/* محتوى نافذة البحث الداخلي */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              
              {/* حقل إدخال نص البحث */}
              <div style={{ marginBottom: '15px' }}>
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    color: isDarkMode ? '#fff' : '#000',
                    boxSizing: 'border-box', fontSize: '15px'
                  }}
                  autoFocus
                />
              </div>

              {/* فلاتر التصفية الثلاثية الذكية */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                <select value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: isDarkMode ? '#0f172a' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}` }}>
                  <option value="all">{t.allDbs}</option>
                  <option value="demo">قاعدة_بيانات_مؤشرات_الكنترول</option>
                </select>
                <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: isDarkMode ? '#0f172a' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}` }}>
                  <option value="all">{t.allTables}</option>
                  <option value="students">Students</option>
                </select>
                <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: isDarkMode ? '#0f172a' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}` }}>
                  <option value="all">{t.allColumns}</option>
                  <option value="name">Student_Name</option>
                </select>
              </div>

              {/* عرض نتائج الكنترول والبحث */}
              <div style={{ flex: 1, marginTop: '10px' }}>
                {searchQuery === '' ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    {t.searchStart}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
                      1 {t.resultsCount}
                    </div>
                    
                    <div style={{
                      border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '6px', overflowX: 'auto'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                        <thead>
                          <tr style={{ background: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                            <th style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>Student_ID</th>
                            <th style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>Student_Name</th>
                            <th style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>Program_Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>MKT094</td>
                            <td style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>حمدي الشرقاوي</td>
                            <td style={{ padding: '10px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>ماجستير تسويق</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
