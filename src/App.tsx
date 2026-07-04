import React, { useState, useEffect, useMemo, useRef } from 'react';
import { read, utils } from 'xlsx';

// ==========================================
// 1. تعريف بالتات الألوان الاحترافية (Themes)
// ==========================================
interface ThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentHover: string;
  headerBg: string;
  highlightBg: string;   // خلفية تمييز النصوص المطابقة المتوافقة مع الموود
  highlightText: string; // لون نص التمييز
}

const themes: Record<string, ThemeColors> = {
  deepDark: {
    bg: '#090d1a',
    cardBg: '#121829',
    text: '#f8fafc',
    textMuted: '#64748b',
    border: '#1e293b',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    headerBg: 'rgba(59, 130, 246, 0.1)',
    highlightBg: 'rgba(59, 130, 246, 0.35)', // تمييز أزرق مشع خفيف يناسب الوضع المظلم
    highlightText: '#ffffff'
  },
  cleanLight: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#cbd5e1',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    headerBg: '#e0f2fe',
    highlightBg: '#fef08a', // تمييز أصفر دافئ مريح للعين في الوضع المضيء
    highlightText: '#0f172a'
  },
  emeraldPro: {
    bg: '#0f1412',
    cardBg: '#17201c',
    text: '#ecfdf5',
    textMuted: '#6b7280',
    border: '#27352f',
    accent: '#10b981',
    accentHover: '#059669',
    headerBg: 'rgba(16, 185, 129, 0.1)',
    highlightBg: 'rgba(16, 185, 129, 0.4)', // تمييز زمردي شفاف متناسق
    highlightText: '#ffffff'
  },
  charcoalLuxury: {
    bg: '#121212',
    cardBg: '#1e1e1e',
    text: '#e0e0e0',
    textMuted: '#a0a0a0',
    border: '#2e2e2e',
    accent: '#f59e0b',
    accentHover: '#d97706',
    headerBg: 'rgba(245, 158, 11, 0.08)',
    highlightBg: 'rgba(245, 158, 11, 0.35)', // تمييز كهرماني فخم
    highlightText: '#ffffff'
  }
};

// ==========================================
// 2. نظام التراجم واللغات (i18n)
// ==========================================
const translations: Record<string, any> = {
  ar: {
    title: "المستكشف",
    subTitle: "نظام ذكي لإدارة والبحث في قواعد البيانات",
    settings: "الإعدادات والإرشادات ⚙️",
    importDb: "استيراد ملف (Excel/CSV)",
    globalSearch: "البحث الشامل 🔍",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للتمكن من البحث",
    savedDbs: "قواعد البيانات النشطة",
    noDbs: "لا توجد قواعد بيانات مستوردة حالياً",
    noDbsSub: "اضغط على زر الاستيراد بالأعلى لاختيار ملفات البيانات وعرضها فوراً في القائمة.",
    tables: "شيتات",
    rows: "صفوف",
    searchPlaceholder: "اكتب هنا للبحث الذكي السريع...",
    allDbs: "جميع الملفات",
    allTables: "كل الشيتات",
    allColumns: "كل الأعمدة",
    searchStart: "ابدأ الكتابة، سيقوم النظام بتصفية الحقول وعرض الصفوف المطابقة فوراً.",
    resultsCount: "نتيجة مطابقة متوفرة في الكروت الكلية",
    maximize: "ملء الشاشة",
    minimize: "نافذة",
    delete: "حذف",
    enableHighlight: "تفعيل تمييز الكلمات المطابقة (Highlight)",
    // كلمات نافذة الإعدادات
    settingsTitle: "لوحة التحكم ودليل التشغيل",
    tabAppearance: "⚙️ المظهر واللغة",
    tabGuide: "📖 دليل التشغيل والإرشادات",
    selectLang: "لغة الواجهة بالتطبيق",
    selectTheme: "اختر بالتة الألوان الاحترافية",
    theme1: "الوضع الليلي الفاخر (Deep Dark)",
    theme2: "الوضع المضيء النقي (Clean Light)",
    theme3: "الوضع الزمردي المهني (Emerald Pro)",
    theme4: "الوضع الفحمي الكلاسيكي (Charcoal)",
    fontSizeLabel: "حجم خط كروت البيانات",
    fontSmall: "صغير",
    fontMedium: "متوسط",
    fontLarge: "كبير",
    borderRadiusLabel: "نمط حواف العناصر والواجهات",
    radiusSharp: "حادة (Sharp)",
    radiusModern: "عصرية (Modern)",
    radiusRounded: "دائرية (Rounded)",
    saveClose: "حفظ وإغلاق"
  },
  en: {
    title: "The Explorer",
    subTitle: "Smart Database Search & Management System",
    settings: "Settings & Guide ⚙️",
    importDb: "Import File (Excel/CSV)",
    globalSearch: "Global Search 🔍",
    importFirst: "Please import a database first to search",
    savedDbs: "Active Databases",
    noDbs: "No active databases loaded",
    noDbsSub: "Click import to load your data files and display them in the list.",
    tables: "sheets",
    rows: "rows",
    searchPlaceholder: "Type here for instant smart search...",
    allDbs: "All Files",
    allTables: "All Sheets",
    allColumns: "All Columns",
    searchStart: "Start typing, the system will instantly extract matching records.",
    resultsCount: "matching records found",
    maximize: "Maximize",
    minimize: "Restore",
    delete: "Delete",
    enableHighlight: "Enable matching text highlighting",
    settingsTitle: "Control Panel & User Guide",
    tabAppearance: "⚙️ Appearance & Language",
    tabGuide: "📖 User Guide & Instructions",
    selectLang: "Application Language",
    selectTheme: "Choose Professional Theme",
    theme1: "Deep Dark Blue",
    theme2: "Clean Slate Light",
    theme3: "Emerald Professional",
    theme4: "Luxury Charcoal",
    fontSizeLabel: "Data Cards Font Size",
    fontSmall: "Small",
    fontMedium: "Medium",
    fontLarge: "Large",
    borderRadiusLabel: "Component Border Style",
    radiusSharp: "Sharp Edge",
    radiusModern: "Modern Edge",
    radiusRounded: "Fully Rounded",
    saveClose: "Save & Close"
  }
};

interface TableStructure {
  tableName: string; 
  columns: string[]; 
  rawData: Array<Record<string, string>>; 
}

interface DatabaseItem {
  id: string;
  name: string;
  cleanName: string;
  sizeFormatted: string;
  tables: TableStructure[]; 
}

export default function App() {
  // حالات الإعدادات والتحكم بالـ UI
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('deepDark');
  const [fontSize, setFontSize] = useState<'14px' | '16px' | '18px'>('16px');
  const [borderRadius, setBorderRadius] = useState<'0px' | '8px' | '16px'>('8px');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'appearance' | 'guide'>('appearance');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // حالات البحث والتمييز
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [useHighlight, setUseHighlight] = useState(true); // التحكم في تفعيل التمييز لعين المستخدم
  
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');

  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const c = useMemo(() => themes[currentThemeKey] || themes.deepDark, [currentThemeKey]);
  const t = useMemo(() => translations[lang], [lang]);

  // آلية التأخير الذكي (Debounce) لمنع الثقل عند الكتابة السريعة
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // دالة ذكية لتقسيم الكلمة المطابقة وتمييزها دون تداخل
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !useHighlight) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark 
              key={index} 
              style={{ 
                background: c.highlightBg, 
                color: c.highlightText, 
                padding: '1px 4px', 
                borderRadius: '3px',
                fontWeight: 'bold'
              }}
            >
              {part}
            </mark>
          ) : part
        )}
      </>
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      try {
        const workbook = read(data, { type: 'array' });
        let parsedSheets: TableStructure[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '—' });
          
          if (jsonData.length > 0) {
            const columns = Object.keys(jsonData[0]);
            const cleanedData = jsonData.map(row => {
              const newRow: Record<string, string> = {};
              columns.forEach(col => {
                newRow[col] = String(row[col]).trim();
              });
              return newRow;
            });

            parsedSheets.push({
              tableName: sheetName,
              columns: columns,
              rawData: cleanedData
            });
          }
        });

        if (parsedSheets.length === 0) {
          alert("الملف المرفوع فارغ أو غير صالح.");
          return;
        }

        const newDb: DatabaseItem = {
          id: 'db-' + Date.now(),
          name: file.name,
          cleanName: cleanName,
          sizeFormatted: formatBytes(file.size),
          tables: parsedSheets
        };

        setDatabases(prev => [...prev, newDb]);
        setSelectedDb(newDb.id);

      } catch (error) {
        alert("فشل في تحليل ملف الإكسيل، تأكد من سلامة بنيته.");
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const dynamicTables = useMemo(() => {
    if (selectedDb === 'all') {
      return Array.from(new Set(databases.flatMap(db => db.tables.map(t => t.tableName))));
    }
    return databases.find(db => db.id === selectedDb)?.tables.map(t => t.tableName) || [];
  }, [selectedDb, databases]);

  const dynamicColumns = useMemo(() => {
    let currentColumns: string[] = [];
    databases.forEach(db => {
      if (selectedDb === 'all' || db.id === selectedDb) {
        db.tables.forEach(tbl => {
          if (selectedTable === 'all' || tbl.tableName === selectedTable) {
            currentColumns = [...currentColumns, ...tbl.columns];
          }
        });
      }
    });
    return Array.from(new Set(currentColumns));
  }, [selectedDb, selectedTable, databases]);

  useEffect(() => {
    setSelectedTable('all');
    setSelectedColumn('all');
  }, [selectedDb]);

  useEffect(() => {
    setSelectedColumn('all');
  }, [selectedTable]);

  const processedResults = useMemo(() => {
    if (!searchQuery) return [];
    let results: Array<{ id: string; dbName: string; tableName: string; fields: Array<{ label: string; value: string }> }> = [];

    databases.forEach(db => {
      if (selectedDb !== 'all' && db.id !== selectedDb) return;
      db.tables.forEach(tbl => {
        if (selectedTable !== 'all' && tbl.tableName !== selectedTable) return;

        tbl.rawData.forEach((row, rowIndex) => {
          const rowString = Object.values(row).join(' ').toLowerCase();
          if (rowString.includes(searchQuery.toLowerCase())) {
            
            const fields = tbl.columns.map(col => ({
              label: col,
              value: row[col] || '—'
            }));

            if (selectedColumn !== 'all') {
              const matchedColumnValue = row[selectedColumn] || '';
              if (!matchedColumnValue.toLowerCase().includes(searchQuery.toLowerCase())) return;
            }

            results.push({
              id: `${db.id}-${tbl.tableName}-${rowIndex}`,
              dbName: db.cleanName,
              tableName: tbl.tableName,
              fields: fields
            });
          }
        });
      });
    });
    return results;
  }, [searchQuery, databases, selectedDb, selectedTable, selectedColumn]);

  return (
    <div style={{
      padding: '24px', background: c.bg, color: c.text, minHeight: '100vh',
      fontFamily: 'Cairo, Tajawal, system-ui, -apple-system, sans-serif',
      direction: lang === 'ar' ? 'rtl' : 'ltr', transition: 'all 0.25s ease'
    }}>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".xlsx,.xls,.csv" />
      
      {/* هيدر التطبيق الاحترافي */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        borderBottom: `1px solid ${c.border}`, paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' 
      }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, fontWeight: '800', color: c.accent }}>{t.title}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: c.textMuted }}>{t.subTitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setIsModalOpen(true); setSearchInput(''); setSearchQuery(''); }} style={{ padding: '12px 20px', background: c.accent, color: '#fff', border: 'none', borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>{t.globalSearch}</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.importDb}</button>
          <button onClick={() => { setIsSettingsOpen(true); setActiveSettingsTab('appearance'); }} style={{ padding: '12px 16px', background: c.cardBg, color: c.text, border: `1px solid ${c.border}`, borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.settings}</button>
        </div>
      </header>

      {/* لوحة قواعد البيانات المخزنة */}
      <main style={{ marginTop: '35px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '18px', fontWeight: '700' }}>{t.savedDbs}</h2>
        {databases.length === 0 ? (
          <div style={{ background: c.cardBg, border: `2px dashed ${c.border}`, borderRadius: borderRadius, padding: '50px 20px', textAlign: 'center', color: c.textMuted }}>
            <h3 style={{ margin: '0 0 8px 0', color: c.text }}>{t.noDbs}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{t.noDbsSub}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {databases.map((db) => (
              <div key={db.id} style={{ background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: borderRadius, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: c.accent, fontSize: '16px', fontWeight: 'bold' }}>{db.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textMuted }}>{db.tables.length} {t.tables} | {db.sizeFormatted}</p>
                </div>
                <button onClick={() => setDatabases(databases.filter(d => d.id !== db.id))} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end' }}>{t.delete}</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ==========================================
          3. شاشة الإعدادات ودليل الإرشادات (Settings & Guide Modal)
          ========================================== */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ 
            background: c.cardBg, color: c.text, padding: '28px', borderRadius: borderRadius, 
            width: '100%', maxWidth: '650px', height: '80vh', border: `1px solid ${c.border}`, 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: c.accent }}>{t.settingsTitle}</h3>
            
            {/* التبويبات الداخلية للإعدادات والتعليمات */}
            <div style={{ display: 'flex', borderBottom: `2px solid ${c.border}`, marginBottom: '20px', gap: '5px' }}>
              <button 
                onClick={() => setActiveSettingsTab('appearance')}
                style={{
                  padding: '10px 16px', background: activeSettingsTab === 'appearance' ? c.bg : 'transparent',
                  color: activeSettingsTab === 'appearance' ? c.accent : c.textMuted, border: 'none',
                  borderBottom: activeSettingsTab === 'appearance' ? `3px solid ${c.accent}` : 'none',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                }}
              >
                {t.tabAppearance}
              </button>
              <button 
                onClick={() => setActiveSettingsTab('guide')}
                style={{
                  padding: '10px 16px', background: activeSettingsTab === 'guide' ? c.bg : 'transparent',
                  color: activeSettingsTab === 'guide' ? c.accent : c.textMuted, border: 'none',
                  borderBottom: activeSettingsTab === 'guide' ? `3px solid ${c.accent}` : 'none',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                }}
              >
                {t.tabGuide}
              </button>
            </div>

            {/* محتوى التبويبات */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
              
              {/* تبويب المظهر واللغة */}
              {activeSettingsTab === 'appearance' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.selectLang}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setLang('ar')} style={{ flex: 1, padding: '10px', background: lang === 'ar' ? c.accent : c.bg, color: lang === 'ar' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>العربية</button>
                      <button onClick={() => setLang('en')} style={{ flex: 1, padding: '10px', background: lang === 'en' ? c.accent : c.bg, color: lang === 'en' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>English</button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.selectTheme}</label>
                    <select value={currentThemeKey} onChange={(e) => setCurrentThemeKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 'bold', outline: 'none' }}>
                      <option value="deepDark">{t.theme1}</option>
                      <option value="cleanLight">{t.theme2}</option>
                      <option value="emeraldPro">{t.theme3}</option>
                      <option value="charcoalLuxury">{t.theme4}</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.fontSizeLabel}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['14px', '16px', '18px'] as const).map(size => (
                        <button key={size} onClick={() => setFontSize(size)} style={{ flex: 1, padding: '8px', background: fontSize === size ? c.accent : c.bg, color: fontSize === size ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: size }}>
                          {size === '14px' ? t.fontSmall : size === '16px' ? t.fontMedium : t.fontLarge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.borderRadiusLabel}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setBorderRadius('0px')} style={{ flex: 1, padding: '8px', background: borderRadius === '0px' ? c.accent : c.bg, color: borderRadius === '0px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '0px', cursor: 'pointer' }}>{t.radiusSharp}</button>
                      <button onClick={() => setBorderRadius('8px')} style={{ flex: 1, padding: '8px', background: borderRadius === '8px' ? c.accent : c.bg, color: borderRadius === '8px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer' }}>{t.radiusModern}</button>
                      <button onClick={() => setBorderRadius('16px')} style={{ flex: 1, padding: '8px', background: borderRadius === '16px' ? c.accent : c.bg, color: borderRadius === '16px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '12px', cursor: 'pointer' }}>{t.radiusRounded}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب دليل التشغيل والإرشادات الشامل (منظم وبسيط) */}
              {activeSettingsTab === 'guide' && (
                <div style={{ lineHeight: '1.7', fontSize: '14px', textAlign: 'start' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: c.accent, fontWeight: 'bold' }}>🚀 نظرة عامة على تطبيق المستكشف:</h4>
                  <p style={{ margin: '0 0 16px 0', color: c.textMuted }}>تم تصميم هذا النظام لتمكينك من استيراد قواعد البيانات والملفات الكبيرة والبحث داخل كافة شيتاتها وحقولها بسرعة البرق وبدون أي اتصال بالإنترنت.</p>

                  <h4 style={{ margin: '0 0 8px 0', color: c.accent, fontWeight: 'bold' }}>1️⃣ استيراد البيانات (Import):</h4>
                  <ul style={{ margin: '0 0 16px 0', paddingRight: '20px', paddingLeft: '20px', color: c.textMuted }}>
                    <li>يدعم التطبيق حالياً ملفات <b>Excel (.xlsx, .xls)</b> وملفات <b>CSV</b> المقسمة بفواصل.</li>
                    <li>عند استيراد أي ملف، يقوم المحرك الذكي بقراءة كافة "الشيتات" المتواجدة داخله بشكل تلقائي وتهيئتها للبحث المباشر.</li>
                  </ul>

                  <h4 style={{ margin: '0 0 8px 0', color: c.accent, fontWeight: 'bold' }}>2️⃣ محرك البحث الشامل (Global Search):</h4>
                  <ul style={{ margin: '0 0 16px 0', paddingRight: '20px', paddingLeft: '20px', color: c.textMuted }}>
                    <li><b>البحث السلس والسرعة:</b> يمتلك التطبيق آلية تأخير ذكي للبحث، تتيح لك الكتابة بسلاسة فائقة دون أي ثقل (Lag) حتى في الملفات المليونية.</li>
                    <li><b>الفلترة المتقدمة:</b> يمكنك حصر نطاق بحثك في ملف معين، أو شيت محدد، أو حتى عمود مخصص لتسريع الوصول للمعلومة.</li>
                    <li><b>ميزة تمييز النص (Highlight):</b> ميزة تلوين الكلمة المطابقة تلقائياً بلون متوافق مع مظهر التطبيق لسهولة رصدها بالعين، ويمكن إيقافها في أي وقت من زر التحكم بجانب شريط البحث.</li>
                  </ul>

                  <h4 style={{ margin: '0 0 8px 0', color: c.accent, fontWeight: 'bold' }}>3️⃣ شروط هامة لملفات Word & PDF (قيد التطوير):</h4>
                  <ul style={{ margin: '0 0 16px 0', paddingRight: '20px', paddingLeft: '20px', color: c.textMuted }}>
                    <li><b>ملفات PDF المدعومة:</b> يجب أن تكون ملفات PDF منسوخة أو مستخرجة من نصوص أصلية (Digital PDF).</li>
                    <li><b>الملفات المصورة (Scanned):</b> الأوراق المصورة بكاميرا الهاتف أو السكنر غير مدعومة حالياً لأنها تُعامل كصور ثابتة وتتطلب معالجة ثقيلة قد تضر بسرعة محرك البحث.</li>
                  </ul>

                  <h4 style={{ margin: '0 0 8px 0', color: c.accent, fontWeight: 'bold' }}>4️⃣ الطباعة والتقارير (قيد التطوير):</h4>
                  <ul style={{ margin: '0 0 5px 0', paddingRight: '20px', paddingLeft: '20px', color: c.textMuted }}>
                    <li>سيتاح قريباً زر تصدير مباشر لنتائج البحث المصفاة في تقرير ورقي منظم بحجم <b>A4</b> جاهز للحفظ أو الطباعة المباشرة، مع خيارات متطورة لإخفاء أو إظهار العلامات الملونة للتقارير الرسمية.</li>
                  </ul>
                </div>
              )}

            </div>

            <button onClick={() => setIsSettingsOpen(false)} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>{t.saveClose}</button>
          </div>
        </div>
      )}

      {/* ==========================================
          4. نافذة البحث الشامل والمحسن مع التمييز
          ========================================== */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: isMaximized ? 0 : '24px' }}>
          <div style={{
            background: c.cardBg, color: c.text, borderRadius: isMaximized ? '0px' : borderRadius, 
            width: isMaximized ? '100vw' : '90vw', height: isMaximized ? '100vh' : '85vh',
            maxWidth: isMaximized ? '100vw' : '1200px', maxHeight: isMaximized ? '100vh' : '850px',
            display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box',
            border: `1px solid ${c.border}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', transition: 'all 0.2s'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: c.accent }}>{t.globalSearch}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isMaximized ? t.minimize : t.maximize}</button>
                <button onClick={() => { setIsModalOpen(false); setIsMaximized(false); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {databases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {t.importFirst}</div>
              ) : (
                <>
                  {/* صندوق البحث المحسن والذكي */}
                  <div style={{ marginBottom: '12px', position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{
                        width: '100%', 
                        paddingTop: '14px', paddingBottom: '14px',
                        paddingLeft: lang === 'ar' ? '16px' : '48px',
                        paddingRight: lang === 'ar' ? '48px' : '16px',
                        borderRadius: '8px', border: `1px solid ${c.border}`,
                        background: c.bg, color: c.text,
                        boxSizing: 'border-box', fontSize: '16px', outline: 'none'
                      }}
                      autoFocus
                    />
                    <span style={{ 
                      position: 'absolute', 
                      left: lang === 'ar' ? 'auto' : '16px', 
                      right: lang === 'ar' ? '16px' : 'auto', 
                      top: '50%', transform: 'translateY(-50%)',
                      fontSize: '18px', pointerEvents: 'none'
                    }}>🔍</span>
                  </div>

                  {/* خيار تحكم المستخدم السريع في تفعيل/تعطيل الـ Highlight */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'flex-start' }}>
                    <input 
                      type="checkbox" 
                      id="highlightToggle" 
                      checked={useHighlight} 
                      onChange={(e) => setUseHighlight(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: c.accent }}
                    />
                    <label htmlFor="highlightToggle" style={{ fontSize: '13px', color: c.textMuted, cursor: 'pointer', fontWeight: '600' }}>
                      {t.enableHighlight}
                    </label>
                  </div>

                  {/* فلاتر الفرز المتقدمة */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <select value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, outline: 'none' }}>
                      <option value="all">{t.allDbs}</option>
                      {databases.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
                    </select>

                    <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, outline: 'none' }}>
                      <option value="all">{t.allTables}</option>
                      {dynamicTables.map((tbl, i) => <option key={i} value={tbl}>{tbl}</option>)}
                    </select>

                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, outline: 'none' }}>
                      <option value="all">{t.allColumns}</option>
                      {dynamicColumns.map((col, i) => <option key={i} value={col}>{col}</option>)}
                    </select>
                  </div>

                  {/* قائمة عرض كروت البيانات */}
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {searchInput === '' ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: c.textMuted, fontSize: '14px' }}>{t.searchStart}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '13px', color: c.textMuted, textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: 'bold' }}>
                          {processedResults.length} {t.resultsCount}
                        </div>
                        
                        {processedResults.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px', fontWeight: 'bold' }}>لا توجد سجلات مطابقة للبحث الحالي.</div>
                        ) : (
                          processedResults.map((result) => (
                            <div key={result.id} style={{
                              background: c.bg, border: `1px solid ${c.border}`,
                              borderRadius: borderRadius, overflow: 'hidden'
                            }}>
                              <div style={{
                                background: c.headerBg, padding: '12px 20px', 
                                borderBottom: `1px solid ${c.border}`, display: 'flex', 
                                justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: 'bold', color: c.accent, fontSize: '14px' }}>
                                  {lang === 'ar' ? `الشيت: ${result.tableName} | الملف: ${result.dbName}` : `Sheet: ${result.tableName} | File: ${result.dbName}`}
                                </span>
                              </div>

                              <div style={{
                                padding: '20px', display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '20px 16px'
                              }}>
                                {result.fields.map((field, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'start' }}>
                                    <span style={{ fontSize: '12px', color: c.textMuted, fontWeight: '600' }}>
                                      {field.label}
                                    </span>
                                    {/* عرض النص مع التمييز الذكي المتغير */}
                                    <span style={{
                                      fontSize: fontSize, fontWeight: '700',
                                      color: field.value === '—' ? c.textMuted : c.text,
                                      wordBreak: 'break-all'
                                    }}>
                                      {renderHighlightedText(field.value, searchQuery)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
