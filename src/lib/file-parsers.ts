/**
 * قارئات الملفات — تحويل أي ملف مستورد (Excel / CSV / SQLite) إلى
 * الصيغة الموحدة التي تفهمها طبقة التخزين (src/lib/db.ts):
 *   { tableName, columns, rows }[]
 *
 * كل قارئ يعمل بالكامل داخل المتصفح (لا يحتاج اتصال بالإنترنت ولا سيرفر).
 */

import type { SqlJsStatic } from 'sql.js';
import type { ImportedSourceType } from './db';

export interface ParsedTable {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface ParseResult {
  sourceType: ImportedSourceType;
  tables: ParsedTable[];
}

/** يحدد نوع الملف بناءً على امتداده */
export function detectSourceType(file: File): ImportedSourceType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'xlsx';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.sqlite') || name.endsWith('.db') || name.endsWith('.sqlite3')) return 'sqlite';
  return null;
}

/** الامتدادات المدعومة، لعرضها في واجهة الاستيراد */
export const SUPPORTED_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.sqlite', '.sqlite3', '.db'];

// ---------------------------------------------------------------
// Excel / CSV
// ---------------------------------------------------------------

async function parseSpreadsheet(file: File, sourceType: 'xlsx' | 'csv'): Promise<ParsedTable[]> {
  const XLSX = await import('xlsx');

  // ملفات CSV تُقرأ كنص UTF-8 صراحة لتفادي مشاكل ترميز الحروف العربية؛
  // ملفات xlsx الثنائية تُقرأ كمصفوفة بايتات لأن التنسيق يحدد ترميزه داخليًا.
  const workbook =
    sourceType === 'csv'
      ? XLSX.read(await file.text(), { type: 'string' })
      : XLSX.read(await file.arrayBuffer(), { type: 'array' });

  const tables: ParsedTable[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // header:1 يعطي مصفوفة صفوف خام (array of arrays) بدل كائنات، لنتحكم نحن بأسماء الأعمدة
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: null });
    if (raw.length === 0) continue;

    const headerRow = raw[0] as unknown[];
    const columns = headerRow.map((c, idx) => (c === null || c === undefined || String(c).trim() === '' ? `عمود ${idx + 1}` : String(c).trim()));

    const dataRows = raw.slice(1);
    const rows: Record<string, unknown>[] = dataRows
      // تجاهل الصفوف الفارغة تمامًا
      .filter((r) => (r as unknown[]).some((v) => v !== null && v !== undefined && String(v).trim() !== ''))
      .map((r) => {
        const arr = r as unknown[];
        const obj: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
          obj[col] = arr[idx] ?? null;
        });
        return obj;
      });

    tables.push({
      tableName: sourceType === 'csv' ? file.name.replace(/\.csv$/i, '') : sheetName,
      columns,
      rows,
    });
  }

  return tables;
}

// ---------------------------------------------------------------
// SQLite
// ---------------------------------------------------------------

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = import('sql.js').then(({ default: initSqlJs }) =>
      initSqlJs({
        // مسار نسبي لموقع الصفحة الحالية (يعمل صح سواء على خادم ويب أو
        // عبر بروتوكول file:// داخل تطبيق Electron لسطح المكتب)
        locateFile: (file) => new URL(file, document.baseURI).href,
      })
    );
  }
  return sqlJsPromise;
}

async function parseSqlite(file: File): Promise<ParsedTable[]> {
  const SQL = await getSqlJs();
  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  try {
    const tableNamesResult = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    if (tableNamesResult.length === 0) return [];

    const tableNames = tableNamesResult[0].values.map((row) => String(row[0]));
    const tables: ParsedTable[] = [];

    for (const tableName of tableNames) {
      const result = db.exec(`SELECT * FROM "${tableName}"`);
      if (result.length === 0) {
        tables.push({ tableName, columns: [], rows: [] });
        continue;
      }
      const { columns, values } = result[0];
      const rows = values.map((valueRow) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
          obj[col] = valueRow[idx];
        });
        return obj;
      });
      tables.push({ tableName, columns, rows });
    }

    return tables;
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------
// نقطة الدخول الموحدة
// ---------------------------------------------------------------

export class UnsupportedFileError extends Error {}

/** يحلل أي ملف مدعوم ويعيد بياناته موحّدة، جاهزة للحفظ عبر saveImportedDatabase */
export async function parseImportedFile(file: File): Promise<ParseResult> {
  const sourceType = detectSourceType(file);

  if (!sourceType) {
    throw new UnsupportedFileError(
      `صيغة الملف "${file.name}" غير مدعومة. الصيغ المدعومة: ${SUPPORTED_EXTENSIONS.join('، ')}`
    );
  }

  if (sourceType === 'xlsx') {
    return { sourceType, tables: await parseSpreadsheet(file, 'xlsx') };
  }
  if (sourceType === 'csv') {
    return { sourceType, tables: await parseSpreadsheet(file, 'csv') };
  }
  return { sourceType, tables: await parseSqlite(file) };
}
