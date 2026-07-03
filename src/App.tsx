import React, { useState } from 'react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  // أضف أي Props إضافية تستخدمها لربط البيانات هنا إذا لزم الأمر
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');
  
  // الـ State الجديد المسؤول عن تكبير وملء الشاشة
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  // ترجمة النصوص المساعدة لواجهة التحكم
  const t = {
    globalSearch: "البحث الشامل",
    placeholder: "ابحث في جميع قواعد البيانات والجداول...",
    allDbs: "جميع قواعد البيانات",
    allTables: "جميع الجداول",
    allColumns: "جميع الأعمدة",
    fullscreenTitle: "ملء الشاشة",
    exitFullscreenTitle: "تصغير الشاشة"
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* ربط كلاس التكبير الديناميكي بناءً على حالة الـ State */}
      <div 
        className={`modal ${isMaximized ? 'fullscreen' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ---------- شريط التحكم العلوي (العنوان + أزرار الحجم والإغلاق) ---------- */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '12px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{t.globalSearch}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* زر ملء الشاشة والتصغير الديناميكي الجديد */}
            <button 
              className="fullscreen-toggle-btn" 
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? t.exitFullscreenTitle : t.fullscreenTitle}
              type="button"
            >
              {isMaximized ? (
                /* أيقونة التصغير (Exit Fullscreen) */
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l6-6M10 14l-6 6"/>
                </svg>
              ) : (
                /* أيقونة التكبير الكامل (Enter Fullscreen) */
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              )}
            </button>

            {/* زر الإغلاق المصحح (X) */}
            <button className="fullscreen-toggle-btn" onClick={onClose} type="button">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* ---------- محتوى النافذة الداخلي (Modal Body) القابل للتمرير بمرونة ---------- */}
        <div className="modal-body">
          
          {/* حقل الإدخال الرئيسي للبحث */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <input
              type="text"
              className="text-input search-input"
              placeholder={t.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* فلاتر التصفية الفرعية */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '10px', 
            marginBottom: '16px' 
          }}>
            <select 
              className="text-input" 
              value={selectedDb} 
              onChange={(e) => setSelectedDb(e.target.value)}
              style={{ fontSize: '13.5px', padding: '8px 12px' }}
            >
              <option value="all">{t.allDbs}</option>
            </select>

            <select 
              className="text-input" 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{ fontSize: '13.5px', padding: '8px 12px' }}
            >
              <option value="all">{t.allTables}</option>
            </select>

            <select 
              className="text-input" 
              value={selectedColumn} 
              onChange={(e) => setSelectedColumn(e.target.value)}
              style={{ fontSize: '13.5px', padding: '8px 12px' }}
            >
              <option value="all">{t.allColumns}</option>
            </select>
          </div>

          {/* ---------- منطقة عرض نتائج البحث والبيانات المطابقة ---------- */}
          <div style={{ marginTop: '12px' }}>
            {searchQuery === '' ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-faint)' }}>
                اكتب كلمة البحث للبدء...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="db-type-tag">قاعدة_بيانات_كاملة_لمؤشرات_الكنترول_ماجستير_تسويق</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Students</span>
                  </div>
                  
                  {/* حاوية جدول البيانات المنسق */}
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student_ID</th>
                          <th>Student_Name</th>
                          <th>Program_Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>MKT094</td>
                          <td>حمدي الشرقاوي</td>
                          <td>ماجستير تسويق</td>
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
