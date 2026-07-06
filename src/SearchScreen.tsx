// SearchScreen.tsx
import React, { useState, useMemo } from 'react';
// استدعاء أداة منع التعليق من نفس المجلد
import { useDebounce } from './useDebounce';

// مكون مخصص لتمييز وحقن اللون الأزرق للكلمات المطابقة (Highlight)
const HighlightText = ({ text, highlight, enabled }: { text: string, highlight: string, enabled: boolean }) => {
  if (!enabled || !highlight.trim()) return <>{text}</>;
  const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '0 4px', borderRadius: '4px' }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default function SearchScreen({ onClose }: { onClose: () => void }) {
  // إدارة حالة مدخلات البحث والـ Debounce لسرعة الاستجابة
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400); // تأخير معالجة الكلمات 400 ملي ثانية لمنع التجمد

  // إدارة حالات الفلاتر الديناميكية
  const [selectedFile, setSelectedFile] = useState('جميع الملفات');
  const [selectedSheet, setSelectedSheet] = useState('كل الشيتات');
  const [selectedColumn, setSelectedColumn] = useState('كل الأعمدة');

  // خيارات التحكم المتقدمة بالتقارير والطباعة المطابقة للفيديو
  const [enableHighlight, setEnableHighlight] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [keepColors, setKeepColors] = useState(true);

  // مصفوفة البيانات التجريبية الدقيقة (Mock Data) لمحاكاة قاعدة بيانات كنترول الماجستير
  const mockData = [
    { Student_ID: 'MKT042', Student_Name: 'سارة عبد الرحمن القاضي', Program_Name: 'ماجستير تسويق' },
    { Student_ID: 'MKT094', Student_Name: 'سارة حمدي الشقفاوي', Program_Name: 'ماجستير تسويق' },
    { Student_ID: 'MKT139', Student_Name: 'سارة حمدي مرزوق', Program_Name: 'ماجستير تسويق' },
  ];

  // تصفية ديناميكية ذكية تعتمد حصراً على القيمة المستقرة (debouncedSearchTerm) لضمان الأداء السريع
  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    return mockData.filter(item => {
      // الفلترة بناءً على حقول الكروت والصفوف
      return Object.values(item).some(val =>
        val.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    });
  }, [debouncedSearchTerm]);

  return (
    <div style={{ backgroundColor: '#0b1120', color: '#fff', minHeight: '100vh', padding: '20px', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* شريط الإغلاق العلوي وملء الشاشة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px', color: '#3b82f6' }}>🔍</span>
          <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '22px' }}>البحث الشامل</h2>
        </div>
        <button onClick={onClose} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>ملء الشاشة</span> ✕
        </button>
      </div>

      {/* حقل البحث الرئيسي السريع */}
      <input
        type="text"
        placeholder="اكتب هنا للبحث الذكي السريع..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '14px 20px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#111827', color: 'white', marginBottom: '20px', fontSize: '16px', outline: 'none' }}
      />

      {/* الفلاتر الثلاثية الذكية (ملفات - شيتات - أعمدة) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} style={{ flex: 1, padding: '12px', backgroundColor: '#111827', color: 'white', border: '1px solid #374151', borderRadius: '6px', outline: 'none' }}>
          <option>جميع الملفات</option>
          <option>قاعدة_بيانات_شاملة_لمؤشرات_كنترول_ماجستير_تسويق</option>
        </select>
        <select value={selectedSheet} onChange={(e) => setSelectedSheet(e.target.value)} style={{ flex: 1, padding: '12px', backgroundColor: '#111827', color: 'white', border: '1px solid #374151', borderRadius: '6px', outline: 'none' }}>
          <option>كل الشيتات</option>
          <option>Students</option>
          <option>Courses</option>
          <option>Exam_Sessions</option>
        </select>
        <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ flex: 1, padding: '12px', backgroundColor: '#111827', color: 'white', border: '1px solid #374151', borderRadius: '6px', outline: 'none' }}>
          <option>كل الأعمدة</option>
          <option>Student_ID</option>
          <option>Student_Name</option>
          <option>Program_Name</option>
        </select>
      </div>

      {/* خيارات التقرير المطبوع ومعايير الـ Highlight */}
      <div style={{ backgroundColor: '#111827', padding: '18px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <input type="checkbox" id="hl" checked={enableHighlight} onChange={(e) => setEnableHighlight(e.target.checked)} style={{ width: '16px', height: '16px' }} />
          <label htmlFor="hl" style={{ fontSize: '14px', cursor: 'pointer' }}>تفعيل تمييز الكلمات المطابقة (Highlight)</label>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #1f2937', marginBottom: '15px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} /> إظهار شعار واسم التطبيق في التقرير الرسمي
            </label>
            <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={keepColors} onChange={(e) => setKeepColors(e.target.checked)} /> الإبقاء على الألوان التمييزية (Highlighter) في الطباعة
            </label>
          </div>
          <button style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>طباعة وحفظ التقرير فوراً</span> 🖨️
          </button>
        </div>
      </div>

      {/* لوحة عرض النتائج وجدول الكروت المرئية */}
      {debouncedSearchTerm && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px 15px', borderRadius: '6px 6px 0 0', borderBottom: '2px solid #3b82f6' }}>
            <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{filteredResults.length} نتيجة مطابقة متوفرة في الحقول الحالية</span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#111827' }}>
              <thead style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}>
                <tr>
                  <th style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>Program_Name</th>
                  <th style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>Student_Name</th>
                  <th style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>Student_ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #1f2937', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#e5e7eb' }}>
                      <HighlightText text={row.Program_Name} highlight={debouncedSearchTerm} enabled={enableHighlight} />
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#e5e7eb', fontWeight: '5px' }}>
                      <HighlightText text={row.Student_Name} highlight={debouncedSearchTerm} enabled={enableHighlight} />
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#9ca3af' }}>
                      <HighlightText text={row.Student_ID} highlight={debouncedSearchTerm} enabled={enableHighlight} />
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '15px' }}>
                      🚫 لا توجد نتائج مطابقة لمدخلات البحث الحالية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}