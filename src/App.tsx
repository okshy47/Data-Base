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
  highlightBg: string;   
  highlightText: string; 
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
    highlightBg: 'rgba(59, 130, 246, 0.35)', 
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
    highlightBg: '#fef08a', 
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
    highlightBg: 'rgba(16, 185, 129, 0.4)', 
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
    highlightBg: 'rgba(245, 158, 11, 0.35)', 
    highlightText: '#ffffff'
  }
};

// ==========================================
// مكون الشعار الرسومي (المكبر والمجلد الذكي) المتوافق مع الثيمات
// ==========================================
const AppLogo = ({ accentColor, size = 40 }: { accentColor: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H10L12 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20Z" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={`${accentColor}15`} />
    <circle cx="14" cy="13" r="3" stroke={accentColor} strokeWidth="2" fill="#090d1a" />
    <path d="M16.5 15.5L19.5 18.5" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

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
    printReport: "طباعة وحفظ التقرير (A4) 🖨️",
    printOptions: "خيارات تنسيق التقرير المطبوع:",
    showLogoOpt: "إظهار شعار واسم التطبيق في التقرير الرسمي",
    keepHighlightOpt: "الإبقاء على الألوان التمييزية (Highlighter) في الطباعة",
    reportTitle: "تقرير بحث شامل ومنسق",
    searchWord: "كلمة البحث الحالية:",
    reportDate: "تاريخ توليد التقرير:",
    fileLabel: "📁 ملف:",
    sheetLabel: "📊 شيت:",
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
    printReport: "Print & Save Report (A4) 🖨️",
    printOptions: "Printed Report Customization Options:",
    showLogoOpt: "Show application name and logo in official report",
    keepHighlightOpt: "Keep text highlighting colors in print out",
    reportTitle: "Comprehensive Search Report",
    searchWord: "Search Keyword:",
    reportDate: "Report Generation Date:",
    fileLabel: "📁 File:",
    sheetLabel: "📊 Sheet:",
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
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('deepDark');
  const [fontSize, setFontSize] = useState<'14px' | '16px' | '18px'>('16px');
  const [borderRadius, setBorderRadius] = useState<'0px' | '8px' | '16px'>('8px');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'appearance' | 'guide'>('appearance');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [useHighlight, setUseHighlight] = useState(true); 

  // حالات خيارات الطباعة المتقدمة
  const [printShowLogo, setPrintShowLogo] = useState(true);
  const [printKeepHighlight, setPrintKeepHighlight] = useState(false);
  
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');

  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const c = useMemo(() => themes[currentThemeKey] || themes.deepDark, [currentThemeKey]);
  const t = useMemo(() => translations[lang], [lang]);

  // استخدام تكتيك الـ Debounce المحسن للبحث الداخلي
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const renderHighlightedText = (text: string, query: string, forceNoHighlight = false) => {
    if (!query || forceNoHighlight) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark 
              key={index} 
              className="printable-mark"
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
      const sheetsSet = new Set<string>();
      for (let i = 0; i < databases.length; i++) {
        const db = databases[i];
        for (let j = 0; j < db.tables.length; j++) {
          sheetsSet.add(db.tables[j].tableName);
        }
      }
      return Array.from(sheetsSet);
    }
    return databases.find(db => db.id === selectedDb)?.tables.map(t => t.tableName) || [];
  }, [selectedDb, databases]);

  const dynamicColumns = useMemo(() => {
    const columnsSet = new Set<string>();
    
    for (let i = 0; i < databases.length; i++) {
      const db = databases[i];
      if (selectedDb !== 'all' && db.id !== selectedDb) continue;
      
      for (let j = 0; j < db.tables.length; j++) {
        const tbl = db.tables[j];
        if (selectedTable !== 'all' && tbl.tableName !== selectedTable) continue;
        
        for (let k = 0; k < tbl.columns.length; k++) {
          columnsSet.add(tbl.columns[k]);
        }
      }
    }
    return Array.from(columnsSet);
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

  const structuredPrintData = useMemo(() => {
    const grouped: Record<string, Record<string, Array<Array<{ label: string; value: string }>>>> = {};
    
    processedResults.forEach(res => {
      if (!grouped[res.dbName]) {
        grouped[res.dbName] = {};
      }
      if (!grouped[res.dbName][res.tableName]) {
        grouped[res.dbName][res.tableName] = [];
      }
      grouped[res.dbName][res.tableName].push(res.fields);
    });
    
    return grouped;
  }, [processedResults]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateString = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{
      padding: '24px', background: c.bg, color: c.text, minHeight: '100vh',
      fontFamily: 'Cairo, Tajawal, system-ui, -apple-system, sans-serif',
      direction: lang === 'ar' ? 'rtl' : 'ltr', transition: 'all 0.25s ease'
    }}>
      
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            direction: ${lang === 'ar' ? 'rtl' : 'ltr'} !important;
          }
          header, main, select, input, button, label, .screen-only, #highlightToggle {
            display: none !important;
          }
          .print-report-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-header-badge {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .printable-mark {
            background: ${printKeepHighlight ? c.highlightBg : 'transparent'} !important;
            color: ${printKeepHighlight ? c.highlightText : 'inherit'} !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: ${printKeepHighlight ? '1px 4px' : '0'} !important;
            border-radius: ${printKeepHighlight ? '3px' : '0'} !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 25px !important;
            page-break-inside: avoid !important;
          }
          .print-table th {
            background-color: #e2e8f0 !important;
            color: #0f172a !important;
            font-weight: bold !important;
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            font-size: 13px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            font-size: 12px !important;
            color: #334155 !important;
          }
          .print-file-section {
            page-break-before: auto !important;
            margin-top: 30px !important;
          }
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
        }
        .print-report-container {
          display: none;
        }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".xlsx,.xls,.csv" />
      
      <header className="screen-only" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        borderBottom: `1px solid ${c.border}`, paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* دمج اللوجو الذكي في واجهة التطبيق الرئيسية */}
          <AppLogo accentColor={c.accent} size={48} />
          <div>
            <h1 style={{ fontSize: '26px', margin: 0, fontWeight: '800', color: c.accent }}>{t.title}</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: c.textMuted }}>{t.subTitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setIsModalOpen(true); setSearchInput(''); setSearchQuery(''); }} style={{ padding: '12px 20px', background: c.accent, color: '#fff', border: 'none', borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.globalSearch}</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.importDb}</button>
          <button onClick={() => { setIsSettingsOpen(true); setActiveSettingsTab('appearance'); }} style={{ padding: '12px 16px', background: c.cardBg, color: c.text, border: `1px solid ${c.border}`, borderRadius: borderRadius, cursor: 'pointer', fontWeight: 'bold' }}>{t.settings}</button>
        </div>
      </header>

      <main className="screen-only" style={{ marginTop: '35px' }}>
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

      {/* نافذة البحث الشامل والمتقدم الرائعة (Modal) */}
      {isModalOpen && (
        <div className="screen-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(4,8,16,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ 
            background: c.cardBg, color: c.text, padding: '24px', borderRadius: borderRadius, 
            width: '100%', maxWidth: isMaximized ? '96vw' : '840px', height: isMaximized ? '94vh' : '85vh', 
            border: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease'
          }}>
            
            {/* الجزء العلوي المطور: أزرار التحكم واللوجو الاحترافي */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* دمج اللوجو الذكي أعلى شاشة البحث بشكل مركزي فخم */}
                <AppLogo accentColor={c.accent} size={36} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: c.accent }}>{t.globalSearch}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.textMuted, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  {isMaximized ? t.minimize : t.maximize}
                </button>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>

            {/* شريط الإدخال ومحرك الفلاتر */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input 
                type="text" 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                placeholder={t.searchPlaceholder} 
                style={{ width: '100%', padding: '14px 16px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '10px', fontSize: '16px', outline: 'none' }}
              />
            </div>

            {/* الفلاتر الذكية ثلاثية الأبعاد (ملف - شيت - عمود) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <select value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)} style={{ padding: '10px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', outline: 'none', fontWeight: '600' }}>
                <option value="all">{t.allDbs}</option>
                {databases.map(db => <option key={db.id} value={db.id}>{db.cleanName}</option>)}
              </select>

              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ padding: '10px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', outline: 'none', fontWeight: '600' }}>
                <option value="all">{t.allTables}</option>
                {dynamicTables.map(tblName => <option key={tblName} value={tblName}>{tblName}</option>)}
              </select>

              <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ padding: '10px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', outline: 'none', fontWeight: '600' }}>
                <option value="all">{t.allColumns}</option>
                {dynamicColumns.map(colName => <option key={colName} value={colName}>{colName}</option>)}
              </select>
            </div>

            {/* خيارات التخصيص والطباعة السريعة قبل إخراج التقرير */}
            <div style={{ background: c.bg, padding: '12px', borderRadius: '8px', border: `1px solid ${c.border}`, marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input type="checkbox" checked={useHighlight} onChange={(e) => setUseHighlight(e.target.checked)} />
                {t.enableHighlight}
              </label>
              
              <div style={{ height: '1px', background: c.border, margin: '4px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: c.textMuted, fontWeight: 'bold' }}>{t.printOptions}</span>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printShowLogo} onChange={(e) => setPrintShowLogo(e.target.checked)} />
                    {t.showLogoOpt}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printKeepHighlight} onChange={(e) => setPrintKeepHighlight(e.target.checked)} />
                    {t.keepHighlightOpt}
                  </label>
                </div>
                <button onClick={handlePrint} disabled={processedResults.length === 0} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: processedResults.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13.5px' }}>
                  {t.printReport}
                </button>
              </div>
            </div>

            {/* عرض النتائج الفورية وعزل التمرير لعدم حدوث Lag */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {processedResults.length === 0 ? (
                <p style={{ textAlign: 'center', color: c.textMuted, marginTop: '40px', fontSize: '14.5px' }}>
                  {searchInput ? "لا توجد نتائج مطابقة لمعايير البحث الحالية." : t.searchStart}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13.5px', color: c.accent, fontWeight: 'bold' }}>
                    {processedResults.length} {t.resultsCount}
                  </div>
                  {processedResults.map((res) => (
                    <div key={res.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '12px', color: c.textMuted, flexWrap: 'wrap', borderBottom: `1px dashed ${c.border}`, paddingBottom: '6px' }}>
                        <span>📁 {res.dbName}</span>
                        <span>📊 {res.tableName}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {res.fields.map((f, idx) => (
                          <div key={idx} style={{ fontSize: fontSize, background: c.cardBg, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${c.border}` }}>
                            <span style={{ display: 'block', fontSize: '11.5px', color: c.textMuted, fontWeight: 'bold', marginBottom: '4px' }}>{f.label}</span>
                            <span style={{ wordBreak: 'break-all', fontWeight: '500' }}>
                              {useHighlight ? renderHighlightedText(f.value, searchQuery) : f.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* لوحة الإعدادات */}
      {isSettingsOpen && (
        <div className="screen-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: c.cardBg, color: c.text, padding: '28px', borderRadius: borderRadius, width: '100%', maxWidth: '650px', height: '80vh', border: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: c.accent }}>{t.settingsTitle}</h3>
            
            <div style={{ display: 'flex', borderBottom: `2px solid ${c.border}`, marginBottom: '20px', gap: '5px' }}>
              <button onClick={() => setActiveSettingsTab('appearance')} style={{ padding: '10px 16px', background: activeSettingsTab === 'appearance' ? c.bg : 'transparent', color: activeSettingsTab === 'appearance' ? c.accent : c.textMuted, border: 'none', borderBottom: activeSettingsTab === 'appearance' ? `3px solid ${c.accent}` : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>{t.tabAppearance}</button>
              <button onClick={() => setActiveSettingsTab('guide')} style={{ padding: '10px 16px', background: activeSettingsTab === 'guide' ? c.bg : 'transparent', color: activeSettingsTab === 'guide' ? c.accent : c.textMuted, border: 'none', borderBottom: activeSettingsTab === 'guide' ? `3px solid ${c.accent}` : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>{t.tabGuide}</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
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
                    <select value={currentThemeKey} onChange={(e) => setCurrentThemeKey(e.target.value)} style={{ width: '100%', padding: '12px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '6px', outline: 'none', fontSize: '14px', fontWeight: '600' }}>
                      <option value="deepDark">{t.theme1}</option>
                      <option value="cleanLight">{t.theme2}</option>
                      <option value="emeraldPro">{t.theme3}</option>
                      <option value="charcoalLuxury">{t.theme4}</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.fontSizeLabel}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {([['14px', t.fontSmall], ['16px', t.fontMedium], ['18px', t.fontLarge]] as const).map(([sz, lbl]) => (
                        <button key={sz} onClick={() => setFontSize(sz)} style={{ flex: 1, padding: '10px', background: fontSize === sz ? c.accent : c.bg, color: fontSize === sz ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: c.textMuted }}>{t.borderRadiusLabel}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {([['0px', t.radiusSharp], ['8px', t.radiusModern], ['16px', t.radiusRounded]] as const).map(([rad, lbl]) => (
                        <button key={rad} onClick={() => setBorderRadius(rad)} style={{ flex: 1, padding: '10px', background: borderRadius === rad ? c.accent : c.bg, color: borderRadius === rad ? '#fff' : c.text, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'guide' && (
                <div style={{ fontSize: '14.5px', lineHeight: '1.8', color: c.text }}>
                  {lang === 'ar' ? (
                    <>
                      <h4 style={{ color: c.accent, margin: '0 0 10px 0', fontWeight: 'bold' }}>💡 إرشادات الاستخدام السريع:</h4>
                      <ul style={{ paddingRight: '20px', margin: 0 }}>
                        <li>قم برفع ملفات الإكسيل بالضغط على زر <b>استيراد ملف</b>.</li>
                        <li>يمكنك رفع أكثر من ملف للعمل عليها بالتوازي في نفس الجلسة.</li>
                        <li>اضغط على زر <b>البحث الشامل</b> لفتح محرك التصفية والمطابقة الفورية للحقول.</li>
                        <li>استخدم خيارات طباعة التقرير لإخراج مستندات A4 رسمية ومطابقتها لمتطلبات العمل.</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4 style={{ color: c.accent, margin: '0 0 10px 0', fontWeight: 'bold' }}>💡 Quick Operation Guide:</h4>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li>Upload your Excel files by clicking the <b>Import File</b> button.</li>
                        <li>You can upload multiple files to look up data concurrently.</li>
                        <li>Open the <b>Global Search</b> dashboard for instant data extraction.</li>
                        <li>Utilize advanced printing options to render well-structured A4 professional sheets.</li>
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setIsSettingsOpen(false)} style={{ width: '100%', padding: '12px', background: c.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>{t.saveClose}</button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 📊 هيكل التقرير الطباعي المخفي المخصص لإخراج مستندات A4 المنسقة */}
      {/* ======================================================= */}
      <div className="print-report-container">
        {printShowLogo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ border: '2px solid #000', padding: '4px', borderRadius: '6px' }}>🔍📁</div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#000' }}>{t.title}</h1>
                <p style={{ fontSize: '12px', margin: '2px 0 0 0', color: '#475569' }}>{t.subTitle}</p>
              </div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '12px', color: '#475569' }}>
              <div>{t.reportDate} {currentDateString}</div>
            </div>
          </div>
        )}

        <div className="print-header-badge" style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>{t.reportTitle}</h2>
          <div>{t.searchWord} <strong style={{ fontSize: '14px', color: '#000' }}>"{searchQuery}"</strong></div>
        </div>

        {Object.keys(structuredPrintData).map(dbName => (
          <div key={dbName} className="print-file-section">
            {Object.keys(structuredPrintData[dbName]).map(tblName => {
              const rowsArray = structuredPrintData[dbName][tblName];
              if (rowsArray.length === 0) return null;
              const headers = rowsArray[0].map(f => f.label);

              return (
                <div key={tblName} style={{ marginBottom: '30px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a', display: 'flex', gap: '15px' }}>
                    <span>{t.fileLabel} {dbName}</span>
                    <span>{t.sheetLabel} {tblName}</span>
                    <span>({rowsArray.length} {t.rows})</span>
                  </div>
                  <table className="print-table">
                    <thead>
                      <tr>
                        {headers.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {rowsArray.map((rowFields, rIdx) => (
                        <tr key={rIdx}>
                          {rowFields.map((f, cIdx) => (
                            <td key={cIdx}>
                              {useHighlight ? renderHighlightedText(f.value, searchQuery) : f.value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
