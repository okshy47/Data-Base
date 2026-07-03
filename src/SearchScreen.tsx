import React from 'react';

export default function SearchScreen({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: '20px', color: '#fff', background: '#0f172a', textDirection: 'rtl' }}>
      <h2>واجهة البحث الشامل قيد التحديث الآمن...</h2>
      <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>إغلاق</button>
    </div>
  );
}
