import React, { useState, useTransition } from 'react';
import { SearchInput } from './components/SearchInput';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition(); // فصل تصفية البيانات في الخلفية
  
  // بيانات تجريبية تحاكي الملفات المرفوعة من أي قاعدة بيانات (Excel/SQL)
  const [databaseRows] = useState<any[]>([
    { "الرقم": 1, "الاسم": "سارة أحمد علي", "كود المادة": "CS101", "التقدير": "امتياز" },
    { "الرقم": 2, "الاسم": "محمد مصطفي", "كود المادة": "AI202", "التقدير": "جيد جداً" }
  ]);

  // محرك البحث الشامل: يبحث في كافة الأعمدة والقيم ديناميكياً
  const filteredResults = databaseRows.filter((row) => {
    if (!searchQuery) return true;
    
    // تحويل كافة قيم السطر إلى نصوص والبحث بداخلها عن الكلمة المطلوبة
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '30px', direction: 'rtl', color: '#FFF' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#00A3FF' }}>مستكشف قواعد البيانات الشامل</h2>
        <p style={{ opacity: 0.7 }}>ابحث في ملفات (Excel / SQLite / وعموم المستندات)</p>
      </header>

      {/* استدعاء مكون البحث المعالج للـ Lag */}
      <SearchInput onSearchChange={(query) => {
        // تنفيذ التصفية الثقيلة في الخلفية باستخدام خطاف الانتقال
        startTransition(() => {
          setSearchQuery(query);
        });
      }} />

      {/* مؤشر برمجى يوضح حالة المعالجة خلف الكواليس */}
      {isPending && <p style={{ color: '#00A3FF' }}>جاري تصفية وتحديث البيانات...</p>}

      {/* جدول عرض البيانات الديناميكي */}
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0B1B3D' }}>
          <thead>
            <tr style={{ backgroundColor: '#00A3FF', color: '#000' }}>
              <th style={{ padding: '12px' }}>الرقم</th>
              <th style={{ padding: '12px' }}>البيانات المسترجعة</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '12px' }}>
                  {/* عرض محتويات السطر بشكل مرن بغض النظر عن أسماء الأعمدة */}
                  {Object.entries(row).map(([key, val]) => (
                    <span key={key} style={{ marginLeft: '15px', fontSize: '14px' }}>
                      <strong>{key}:</strong> {String(val)}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
