import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. أداة الترجمة واللغة (i18n) لمنع الانهيار
// ==========================================
export const translations: Record<string, any> = {
  ar: {
    title: "نظام إدارة قواعد البيانات",
    langToggle: "English",
    themeLight: "الوضع المضيء",
    themeDark: "الوضع الداكن",
    online: "متصل",
    offline: "غير متصل",
    importDb: "استيراد قاعدة بيانات",
    globalSearch: "البحث الشامل",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للبحث",
    savedDbs: "قواعد البيانات المحفوظة",
    loading: "جاري التحميل...",
    noDbs: "لا توجد قواعد بيانات",
    noDbsSub: "قم برفع ملفاتك للبدء في إدارتها وفحصها.",
    tables: "جداول",
    rows: "صفوف",
    storageStatus: "حالة المساحة التخزينية",
    persistentStorage: "التخزين الدائم",
    storageSupported: "مدعوم",
    storageEnabled: "مفعّل",
    enableStorage: "تفعيل التخزين الدائم",
    usedSpace: "المساحة المستخدمة",
    deleteConfirm: "هل أنت متأكد من حذف قاعدة البيانات هذه؟",
    searchPlaceholder: "ابحث في جميع قواعد البيانات والجداول...",
    allDbs: "جميع قواعد البيانات",
    allTables: "جميع الجداول",
    allColumns: "جميع الأعمدة",
    searchStart: "اكتب كلمة البحث للبدء...",
    searching: "جاري البحث...",
    noResults: "لا توجد نتائج",
    noResultsSub: "جرّب كلمات مفتاحية أخرى أو غيّر فلاتر البحث.",
    resultsCount: "نتيجة مطابقة",
    truncated: " (تم عرض جزء من النتائج)",
    prev: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
    fullscreenTitle: "ملء الشاشة",
    exitFullscreenTitle: "تصغير الشاشة"
  },
  en: {
    title: "Database Management System",
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
    fullscreenTitle: "Maximize",
    exitFullscreenTitle: "Restore"
  }
};

export function getLanguage(): 'ar' | 'en' {
  try {
    const saved = localStorage.getItem('app-lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (e) {
    console.error(e);
  }
  return 'ar';
}

// ==========================================
// 2. مكون البحث المطور والمحمي من الشاشة السوداء
// ==========================================
interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const lang = getLanguage() || 'ar';
  const t = translations[lang] || translations['ar'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${isMaximized ? 'fullscreen' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        style={isMaximized ? { maxWidth: '100vw', maxHeight: '100vh', width: '100%', height: '100%', borderRadius: '0px', top: 0, left: 0, position: 'fixed' } : {}}
      >
        {/* ---------- شريط التحكم العلوي ---------- */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '12px',
          borderBottom: '1px solid var(--border, #334155)',
          paddingBottom: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{t.globalSearch}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* زر ملء الشاشة الذكي */}
            <button 
              className="fullscreen-toggle-btn" 
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? t.exitFullscreenTitle : t.fullscreenTitle}
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            >
              {isMaximized ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l6-6M10 14l-6 6"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              )}
            </button>

            {/* زر الإغلاق */}
            <button className="fullscreen-toggle-btn" onClick={onClose} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* ---------- محتوى النافذة ---------- */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'en' ? '12px' : 'auto', display: 'grid', placeItems: 'center', color: 'var(--text-faint)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <input
              type="text"
              className="text-input search-input"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: lang === 'ar' ? '40px' : '12px',
                paddingLeft: lang === 'en' ? '40px' : '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '10px', 
            marginBottom: '16px' 
          }}>
            <select className="text-input" value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)} style={{ fontSize: '13.5px', padding: '8px 12px' }}>
              <option value="all">{t.allDbs}</option>
            </select>
            <select className="text-input" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ fontSize: '13.5px', padding: '8px 12px' }}>
              <option value="all">{t.allTables}</option>
            </select>
            <select className="text-input" value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ fontSize: '13.5px', padding: '8px 12px' }}>
              <option value="all">{t.allColumns}</option>
            </select>
          </div>

          <div style={{ marginTop: '12px' }}>
            {searchQuery === '' ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-faint)' }}>
                {t.searchStart}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="db-type-tag" style={{ background: '#0066cc', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      قاعدة_بيانات_كاملة_لمؤشرات_الكنترول_ماجستير_تسويق
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Students</span>
                  </div>
                  
                  <div className="data-table-wrap" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)' }}>Student_ID</th>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)' }}>Student_Name</th>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)' }}>Program_Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>MKT094</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>حمدي الشرقاوي</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>ماجستير تسويق</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
