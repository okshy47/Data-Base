import React, { useState, useEffect, useMemo, useRef } from 'react';
import { read, utils } from 'xlsx';

// ==========================================
// 1. تعريف بالتات الألوان الاحترافية (Themes)
// ==========================================
interface ThemeColors {
  bg: string;          // الخلفية الأساسية للتطبيق
  cardBg: string;      // خلفية الكروت والجداول
  text: string;        // لون النص الأساسي
  textMuted: string;   // لون النصوص الفرعية والتوضيحية
  border: string;      // لون الحدود والفواصل
  accent: string;      // اللون المميز (الرئيسي للأزرار والرموز)
  accentHover: string; // لون الزر عند تمرير الماوس
  headerBg: string;    // خلفية ترويسة الكروت أو الهيدر
}

const themes: Record<string, ThemeColors> = {
  // 1. الوضع الليلي الفاخر
  deepDark: {
    bg: '#090d1a',
    cardBg: '#121829',
    text: '#f8fafc',
    textMuted: '#64748b',
    border: '#1e293b',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    headerBg: 'rgba(59, 130, 246, 0.1)'
  },
  // 2. الوضع المضيء النقي
  cleanLight: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#cbd5e1',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    headerBg: '#e0f2fe'
  },
  // 3. الوضع الزمردي المهني
  emeraldPro: {
    bg: '#0f1412',
    cardBg: '#17201c',
    text: '#ecfdf5',
    textMuted: '#6b7280',
    border: '#27352f',
    accent: '#10b981',
    accentHover: '#059669',
    headerBg: 'rgba(16, 185, 129, 0.1)'
  },
  // 4. الوضع الفحمي الكلاسيكي
  charcoalLuxury: {
    bg: '#121212',
    cardBg: '#1e1e1e',
    text: '#e0e0e0',
    textMuted: '#a0a0a0',
    border: '#2e2e2e',
    accent: '#f59e0b',
    accentHover: '#d97706',
    headerBg: 'rgba(245, 158, 11, 0.08)'
  }
};

// ==========================================
// 2. نظام التراجم واللغات
// ==========================================
const translations: Record<string, any> = {
  ar: {
    title: "المستكشف",
    subTitle: "نظام ذكي للبحث في قواعد البيانات",
    settings: "الإعدادات ⚙️",
    importDb: "استيراد ملف (Excel/CSV)",
    globalSearch: "البحث الشامل 🔍",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للتمكن من البحث",
    savedDbs: "قواعد البيانات النشطة",
    noDbs: "لا توجد قواعد بيانات مستوردة",
    noDbsSub: "اضغط على زر الاستيراد لاختيار ملفات البيانات وعرضها فوراً.",
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
    // كلمات نافذة الإعدادات
    settingsTitle: "لوحة تحكم المظهر واللغة",
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
    subTitle: "Smart Database Search System",
    settings: "Settings ⚙️",
    importDb: "Import File (Excel/CSV)",
    globalSearch: "Global Search 🔍",
    importFirst: "Please import a database first to search",
    savedDbs: "Active Databases",
    noDbs: "No active databases loaded",
    noDbsSub: "Click import to load your data files and display them.",
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
    settingsTitle: "Appearance & Language Control",
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // حالات البحث
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');

  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب بالتة الألوان الفعالة والترجمة
  const c = useMemo(() => themes[currentThemeKey] || themes.deepDark, [currentThemeKey]);
  const t = useMemo(() => translations[lang], [lang]);

  // آلية التأخير الذكي (Debounce) لمنع الثقل عند الكتابة الفورية
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

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
          <button onClick={() => setIsSettingsOpen(true)} style={{ padding: '12px 16px', background: c.cardBg, color: c.text, border: `1px solid ${c.border}`, borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.settings}</button>
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
          3. شاشة الإعدادات المتقدمة (Settings Modal)
          ========================================== */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: c.cardBg, color: c.text, padding: '28px', borderRadius: borderRadius, width: '100%', maxWidth: '500px', border: `1px solid ${c.border}`, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${c.border}`, paddingBottom: '12px', color: c.accent }}>{t.settingsTitle}</h3>
            
            {/* خيار لغة التطبيق */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.selectLang}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setLang('ar')} style={{ flex: 1, padding: '10px', background: lang === 'ar' ? c.accent : c.bg, color: lang === 'ar' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>العربية</button>
                <button onClick={() => setLang('en')} style={{ flex: 1, padding: '10px', background: lang === 'en' ? c.accent : c.bg, color: lang === 'en' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>English</button>
              </div>
            </div>

            {/* خيار بالتة الألوان الفنية */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.selectTheme}</label>
              <select value={currentThemeKey} onChange={(e) => setCurrentThemeKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 'bold' }}>
                <option value="deepDark">{t.theme1}</option>
                <option value="cleanLight">{t.theme2}</option>
                <option value="emeraldPro">{t.theme3}</option>
                <option value="charcoalLuxury">{t.theme4}</option>
              </select>
            </div>

            {/* خيار حجم الخط لكروت البيانات */}
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

            {/* خيار نمط الحواف الزاوية */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.borderRadiusLabel}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setBorderRadius('0px')} style={{ flex: 1, padding: '8px', background: borderRadius === '0px' ? c.accent : c.bg, color: borderRadius === '0px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '0px', cursor: 'pointer' }}>{t.radiusSharp}</button>
                <button onClick={() => setBorderRadius('8px')} style={{ flex: 1, padding: '8px', background: borderRadius === '8px' ? c.accent : c.bg, color: borderRadius === '8px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer' }}>{t.radiusModern}</button>
                <button onClick={() => setBorderRadius('16px')} style={{ flex: 1, padding: '8px', background: borderRadius === '16px' ? c.accent : c.bg, color: borderRadius === '16px' ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '12px', cursor: 'pointer' }}>{t.radiusRounded}</button>
              </div>
            </div>

            <button onClick={() => setIsSettingsOpen(false)} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>{t.saveClose}</button>
          </div>
        </div>
      )}

      {/* ==========================================
          4. نافذة البحث الشامل والمحسن
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
                  {/* صندوق البحث الديناميكي مع إصلاح التداخل التلقائي */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
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
                              {/* ترويسة الكرت المهيأ بلون البالتة */}
                              <div style={{
                                background: c.headerBg, padding: '12px 20px', 
                                borderBottom: `1px solid ${c.border}`, display: 'flex', 
                                justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: 'bold', color: c.accent, fontSize: '14px' }}>
                                  {lang === 'ar' ? `الشيت: ${result.tableName} | الملف: ${result.dbName}` : `Sheet: ${result.tableName} | File: ${result.dbName}`}
                                </span>
                              </div>

                              {/* شبكة البيانات القابلة لتغيير حجم الخط ديناميكياً */}
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
                                    <span style={{
                                      fontSize: fontSize, fontWeight: '700',
                                      color: field.value === '—' ? c.textMuted : c.text,
                                      wordBreak: 'break-all'
                                    }}>
                                      {field.value}
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
