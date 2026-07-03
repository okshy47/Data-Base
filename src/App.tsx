import React, { useState, useEffect, useMemo, useRef } from 'react';

// ==========================================
// 1. نظام الترجمة (i18n)
// ==========================================
const translations: Record<string, any> = {
  ar: {
    title: "المستكشف | DataExplorer",
    langToggle: "English",
    themeLight: "الوضع المضيء",
    themeDark: "الوضع الداكن",
    online: "متصل",
    importDb: "استيراد قاعدة بيانات",
    globalSearch: "البحث الشامل",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للتمكن من البحث",
    savedDbs: "قواعد البيانات المستوردة والمحفوظة",
    noDbs: "لا توجد قواعد بيانات حالياً",
    noDbsSub: "اضغط على (استيراد قاعدة بيانات) واقرا ملفاتك الحقيقية للبدء في استكشافها.",
    tables: "شيتات / جداول",
    rows: "صفوف",
    storageStatus: "حالة المساحة التخزينية",
    persistentStorage: "التخزين الدائم",
    storageEnabled: "مفعّل",
    usedSpace: "المساحة المستخدمة",
    deleteConfirm: "هل أنت متأكد من حذف قاعدة البيانات هذه؟",
    searchPlaceholder: "اكتب كلمة أو أكثر للبحث وتفريغ السجل بالكامل...",
    allDbs: "جميع قواعد البيانات",
    allTables: "كل الجداول (الشيتات)",
    allColumns: "كل الأعمدة",
    searchStart: "اكتب كلمة بحث للبدء، سيقوم النظام بتفريغ كافة حقول وأعمدة البيان المطابق فوراً.",
    resultsCount: "نتيجة مطابقة داخل الكروت الشاملة",
    maximize: "ملء الشاشة",
    minimize: "تصغير الشاشة"
  },
  en: {
    title: "DataExplorer",
    langToggle: "العربية",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    importDb: "Import Database",
    globalSearch: "Global Search",
    importFirst: "Please import a database first to search",
    savedDbs: "Imported Databases",
    noDbs: "No Databases",
    noDbsSub: "Click (Import Database) to start exploring.",
    tables: "sheets / tables",
    rows: "rows",
    storageStatus: "Storage Status",
    persistentStorage: "Persistent Storage",
    storageEnabled: "Enabled",
    usedSpace: "Used Space",
    deleteConfirm: "Are you sure?",
    searchPlaceholder: "Type to search and extract full record fields...",
    allDbs: "All Databases",
    allTables: "All Tables (Sheets)",
    allColumns: "All Columns",
    searchStart: "Type to search, the system will dynamically extract all columns for matching rows.",
    resultsCount: "results found",
    maximize: "Maximize",
    minimize: "Restore"
  }
};

interface TableStructure {
  tableName: string; // اسم الشيت الداخلي
  columns: string[]; // أعمدة هذا الشيت بالتحديد
  rawData: Array<Record<string, string>>; // بيانات هذا الشيت
}

interface DatabaseItem {
  id: string;
  name: string;
  cleanName: string;
  sizeFormatted: string;
  tables: TableStructure[]; // مصفوفة من الشيتات المستقلة بأعمدتها وبياناتها
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');

  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useMemo(() => translations[lang], [lang]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // محاكاة قراءة ملف إكسيل يحتوي على شيتات (جداول) متعددة حقيقية كما في لقطة الشاشة image_4b5c18.png
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    
    let simulatedSheets: TableStructure[] = [];

    if (file.name.includes('مؤشرات') || file.name.includes('Student')) {
      simulatedSheets = [
        {
          tableName: 'بيانات_الطلاب',
          columns: ['Student_ID', 'Student_Name', 'Program_Name'],
          rawData: [{ 'Student_ID': '1001', 'Student_Name': 'أحمد محمد علي', 'Program_Name': 'دراسات عليا' }]
        },
        {
          tableName: 'نتائج_الامتحانات',
          columns: ['Course_Code', 'Course_Name', 'Written_Score', 'Pass_Mark'],
          rawData: [{ 'Course_Code': 'CS501', 'Course_Name': 'حواسب متقدمة', 'Written_Score': '85', 'Pass_Mark': '60' }]
        }
      ];
    } else {
      // بناء هيكلية الشيتات المتعددة المتطابقة تماماً مع صورة الـ Dropdown المرفقة image_4b5c18.png
      simulatedSheets = [
        {
          tableName: 'الموقف التنفيذي للكلية ج 3',
          columns: ['الوحدة', 'إسم الصنف', 'نوع الصنف', 'الموجود بالعهدة طبقاً لآخر مراجعة لحساب الصنف', 'المتبقى حالياً'],
          rawData: [{ 'الوحدة': 'الكلية', 'إسم الصنف': 'جهاز بنش دامبلز متحرك', 'نوع الصنف': '—', 'الموجود بالعهدة طبقاً لآخر مراجعة لحساب الصنف': '1', 'المتبقى حالياً': '0' }]
        },
        {
          tableName: 'أرشيف_الحركة_العامة',
          columns: ['نوع المستند', 'تاريخ المستند', 'الكمية في المستند', 'المستند من', 'المستند إلى'],
          rawData: [{ 'نوع المستند': 'نقل عهدة', 'تاريخ المستند': '2026-05-12', 'الكمية في المستند': '1', 'المستند من': 'كلية دجو', 'المستند إلى': 'الأكاديمية العسكرية' }]
        },
        {
          tableName: 'سجل_الفحص_والتفتيش',
          columns: ['تاريخ المراجعة', 'الزيادة عن العهدة', 'العجز عن العهدة', 'مكان التحفظ', 'الموقف من العهدة'],
          rawData: [{ 'تاريخ المراجعة': '2026-06-01', 'الزيادة عن العهدة': '—', 'العجز عن العهدة': '—', 'مكان التحفظ': 'مخزن أ', 'الموقف من العهدة': 'داخل' }]
        }
      ];
    }

    const newDb: DatabaseItem = {
      id: 'db-' + Date.now(),
      name: file.name,
      cleanName: cleanName,
      sizeFormatted: formatBytes(file.size),
      tables: simulatedSheets
    };

    setDatabases([...databases, newDb]);
    setSelectedDb(newDb.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // جلب الشيتات (الجداول) المتاحة بناءً على الملف المختار
  const dynamicTables = useMemo(() => {
    if (selectedDb === 'all') {
      return Array.from(new Set(databases.flatMap(db => db.tables.map(t => t.tableName))));
    }
    return databases.find(db => db.id === selectedDb)?.tables.map(t => t.tableName) || [];
  }, [selectedDb, databases]);

  // جلب الأعمدة الخاصة بالشيت (الجدول) المحدد فقط لمنع الخلط والتداخل الدلالي
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

  // تصفير الخيارات الفرعية عند تغيير الملف لضمان المزامنة
  useEffect(() => {
    setSelectedTable('all');
    setSelectedColumn('all');
  }, [selectedDb]);

  useEffect(() => {
    setSelectedColumn('all');
  }, [selectedTable]);

  // محرك البحث لتفريغ كروت الشيت الحقيقي والبيان المطلوب
  const processedResults = useMemo(() => {
    if (!searchQuery) return [];

    let results: Array<{ id: string; dbName: string; tableName: string; fields: Array<{ label: string; value: string }> }> = [];

    databases.forEach(db => {
      if (selectedDb !== 'all' && db.id !== selectedDb) return;

      db.tables.forEach(tbl => {
        if (selectedTable !== 'all' && tbl.tableName !== selectedTable) return;

        tbl.rawData.forEach((row, rowIndex) => {
          const rowString = Object.values(row).join(' ').toLowerCase();
          
          if (rowString.includes(searchQuery.toLowerCase()) || searchQuery === '*') {
            // تفريغ أعمدة الشيت الحالي المفرغ بالكامل داخل الكارت الشامل
            const fields = tbl.columns.map(col => ({
              label: col,
              value: row[col] || '—'
            }));

            // تصفية إضافية إذا كان المستخدم يبحث بداخل عمود محدد
            if (selectedColumn !== 'all') {
              const matchedColumnValue = row[selectedColumn] || '';
              if (!matchedColumnValue.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery !== '*') {
                return;
              }
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
      padding: '20px', background: isDarkMode ? '#0a1124' : '#f8fafc', color: isDarkMode ? '#f8fafc' : '#0f172a',
      minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', direction: lang === 'ar' ? 'rtl' : 'ltr', transition: 'all 0.3s ease'
    }}>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv,.xls,.xlsx,.json,.sql,.db" />
      
      {/* هيدر متطابق تماماً ومعاد له زر تحويل اللغة كمظهر لقطة الشاشة image_4b66c0.png */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDarkMode ? '#1e293b' : '#cbd5e1'}`, paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 'bold', color: '#3b82f6' }}>{t.title}</h1>
          <span style={{ fontSize: '12px', background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{t.online}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.globalSearch}</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.importDb}</button>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '10px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.langToggle}</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px 14px', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{isDarkMode ? t.themeLight : t.themeDark}</button>
        </div>
      </header>

      <main style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>{t.savedDbs}</h2>
        {databases.length === 0 ? (
          <div style={{ background: isDarkMode ? '#111936' : '#ffffff', border: `2px dashed ${isDarkMode ? '#1e293b' : '#cbd5e1'}`, borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <h3 style={{ margin: '0 0 8px 0', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{t.noDbs}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{t.noDbsSub}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {databases.map((db) => (
              <div key={db.id} style={{ background: isDarkMode ? '#111936' : '#ffffff', border: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`, borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#3b82f6' }}>{db.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{db.tables.length} {t.tables} | الحجم: {db.sizeFormatted}</p>
                </div>
                <button onClick={() => setDatabases(databases.filter(d => d.id !== db.id))} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* نافذة مستكشف البيانات والبحث الشامل المتطور بسحب الشيتات الحقيقية */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: isMaximized ? 0 : '20px' }}>
          <div style={{
            background: isDarkMode ? '#141c38' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a',
            borderRadius: isMaximized ? '0px' : '16px', width: isMaximized ? '100vw' : '90vw', height: isMaximized ? '100vh' : '85vh',
            maxWidth: isMaximized ? '100vw' : '1155px', maxHeight: isMaximized ? '100vh' : '800px',
            display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: `1px solid ${isDarkMode ? '#22315e' : '#e2e8f0'}`
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{t.globalSearch}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: '#22315e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{isMaximized ? t.minimize : t.maximize}</button>
                <button onClick={() => { setIsModalOpen(false); setIsMaximized(false); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {databases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {t.importFirst}</div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%', padding: '14px 40px 14px 14px', borderRadius: '8px',
                        border: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}`,
                        background: isDarkMode ? '#0a1124' : '#f8fafc', color: isDarkMode ? '#fff' : '#000',
                        boxSizing: 'border-box', fontSize: '16px'
                      }}
                      autoFocus
                    />
                    <span style={{ position: 'absolute', left: lang === 'ar' ? 'auto' : '15px', right: lang === 'ar' ? '15px' : 'auto', top: '35%', color: '#64748b' }}>🔍</span>
                  </div>

                  {/* القوائم المنسدلة المرتبطة بهيكلية الشيتات المستخرجة ديناميكياً */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <select value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: isDarkMode ? '#0a1124' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}` }}>
                      <option value="all">{t.allDbs}</option>
                      {databases.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
                    </select>

                    <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: isDarkMode ? '#0a1124' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}` }}>
                      <option value="all">{t.allTables}</option>
                      {dynamicTables.map((tbl, i) => <option key={i} value={tbl}>{tbl}</option>)}
                    </select>

                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: isDarkMode ? '#0a1124' : '#f8fafc', color: isDarkMode ? '#fff' : '#000', border: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}` }}>
                      <option value="all">{t.allColumns}</option>
                      {dynamicColumns.map((col, i) => <option key={i} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {searchQuery === '' ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '14px' }}>{t.searchStart}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '14px', color: '#64748b', textAlign: 'left', direction: 'ltr', fontWeight: 'bold' }}>
                          {processedResults.length} {t.resultsCount}
                        </div>
                        
                        {processedResults.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
                        ) : (
                          processedResults.map((result) => (
                            <div key={result.id} style={{
                              background: isDarkMode ? '#0a1124' : '#f1f5f9',
                              border: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}`,
                              borderRadius: '10px', overflow: 'hidden',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                              <div style={{
                                background: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : '#e0f2fe',
                                padding: '12px 20px', borderBottom: `1px solid ${isDarkMode ? '#22315e' : '#cbd5e1'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '15px' }}>
                                  الشيت: {result.tableName} | الملف الأساسي: {result.dbName}
                                </span>
                              </div>

                              {/* شبكة توزيع كارت البيان التفاعلي المقسم إلى ٣ أعمدة مريحة لعرض السجل كاملاً */}
                              <div style={{
                                padding: '20px', display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '24px 16px', direction: 'rtl'
                              }}>
                                {result.fields.map((field, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                      {field.label}
                                    </span>
                                    <span style={{
                                      fontSize: '16px', fontWeight: 'bold',
                                      color: field.value === '—' ? '#64748b' : (isDarkMode ? '#ffffff' : '#0f172a'),
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
