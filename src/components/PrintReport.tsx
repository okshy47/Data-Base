import React from 'react';

interface PrintReportProps {
  data: any[];
  title?: string;
}

export const PrintReport: React.FC<PrintReportProps> = ({ data, title = 'تقرير مستندات البيانات' }) => {
  if (!data || data.length === 0) return null;

  // استخراج أسماء الأعمدة ديناميكياً من أول عنصر في البيانات لضمان مرونة التصميم
  const headers = Object.keys(data[0]);

  return (
    <div className="print-only-container" style={{ direction: 'rtl', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      {/* تنسيق الستاين الخاص بالطباعة لإخفاء عناصر واجهة التطبيق والتحكم في حجم ورق A4 */}
      <style>{`
        @media screen {
          .print-only-container { display: none !important; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-only-container, .print-only-container * { visibility: visible; }
          .print-only-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* ترويسة التقرير الرسمية الفخمة */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '15px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: 'bold' }}>{title}</h2>
        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>تاريخ ترحيل التقرير الآلي: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* جدول عرض البيانات الطباعي المتناسق */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' }}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#F3F4F6', fontWeight: 'bold', textAlign: 'right' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
