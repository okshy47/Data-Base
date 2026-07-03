/**
 * تصدير البيانات المستوردة إلى ملفات يمكن فتحها خارج التطبيق (Excel / CSV).
 * يعمل بالكامل داخل المتصفح بدون إنترنت، باستخدام مكتبة xlsx (محمّلة كسوليًا).
 */

import type { ImportedTableSchema } from './db';

/** يصدّر جدولًا واحدًا كملف CSV (يحمّله المتصفح مباشرة) */
export async function exportTableAsCsv(tableName: string, rows: Record<string, unknown>[]) {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  // إضافة BOM لضمان ظهور النصوص العربية بشكل صحيح عند فتح الملف في Excel
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFileName(tableName)}.csv`);
}

/** يصدّر قاعدة بيانات كاملة (كل جداولها) كملف Excel واحد متعدد الأوراق */
export async function exportDatabaseAsExcel(
  databaseName: string,
  tables: { schema: ImportedTableSchema; rows: Record<string, unknown>[] }[]
) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  for (const { schema, rows } of tables) {
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: schema.columns });
    // أسماء أوراق Excel محدودة بـ 31 حرفًا ولا تقبل بعض الرموز
    const safeSheetName = schema.tableName.replace(/[[\]*/\\?:]/g, '').slice(0, 31) || 'Sheet1';
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  }

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${sanitizeFileName(databaseName)}.xlsx`);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'export';
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
