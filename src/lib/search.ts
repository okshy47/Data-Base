/**
 * محرك البحث
 * -----------
 * يبحث داخل كل الصفوف المخزّنة محليًا (عبر searchBlob المُجهّز مسبقًا مع كل صف)
 * بدون أي اتصال بالإنترنت. يدعم:
 *   - البحث عبر كل قواعد البيانات دفعة واحدة أو داخل قاعدة/جدول محدد
 *   - عدة كلمات بحث (كل الكلمات لازم تكون موجودة - AND)
 *   - البحث داخل عمود محدد بدل كل الأعمدة
 *   - نتائج مقسّمة على صفحات (pagination) لتفادي إبطاء الواجهة مع البيانات الكبيرة
 */

import { appDb, type ImportedRow, type ImportedDatabase, type ImportedTableSchema } from './db';

export interface SearchFilters {
  /** نص البحث؛ يُقسَّم على المسافات وتُطلب كل الكلمات (AND) */
  query: string;
  /** قصر البحث على قاعدة بيانات محددة، أو null لكل القواعد */
  databaseId?: number | null;
  /** قصر البحث على جدول محدد (يتطلب databaseId)، أو null لكل الجداول */
  tableName?: string | null;
  /** قصر البحث على عمود محدد بدل كل أعمدة الصف */
  column?: string | null;
}

export interface SearchResultItem {
  row: ImportedRow;
  databaseName: string;
}

export interface SearchResponse {
  items: SearchResultItem[];
  /** إجمالي عدد المطابقات (قد يكون أكبر من items.length إن استُخدم الصفحات) */
  totalMatches: number;
  /** هل توقف البحث بسبب الوصول للحد الأقصى؟ (حماية من تجميد الواجهة) */
  truncated: boolean;
}

const MAX_ROWS_TO_SCAN = 200_000; // سقف أمان لمنع تجميد الواجهة مع قواعد بيانات ضخمة جدًا
const DEFAULT_PAGE_SIZE = 50;

/** يقسّم نص البحث لكلمات صغيرة الحروف، بعد إزالة الفراغات الزائدة */
function tokenize(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/** يتحقق أن كل كلمات البحث موجودة داخل searchBlob الخاص بالصف (أو داخل عمود محدد فقط) */
function rowMatches(row: ImportedRow, tokens: string[], column?: string | null): boolean {
  const haystack = column
    ? String(row.data[column] ?? '').toLowerCase()
    : row.searchBlob;
  return tokens.every((t) => haystack.includes(t));
}

/**
 * ينفّذ البحث. يمسح الصفوف ذات الصلة (مُقيّدة بـ databaseId/tableName إن وُجدا عبر
 * فهارس Dexie لتسريع الاستعلام)، ثم يطابق كل صف مع كلمات البحث في الذاكرة.
 */
export async function searchRows(
  filters: SearchFilters,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<SearchResponse> {
  const tokens = tokenize(filters.query);
  if (tokens.length === 0) {
    return { items: [], totalMatches: 0, truncated: false };
  }

  // نجهّز خريطة databaseId -> اسم القاعدة لعرضها مع كل نتيجة
  const databases = await appDb.databases.toArray();
  const nameById = new Map<number, string>(databases.map((d) => [d.id as number, d.name]));

  let collection = appDb.rows.toCollection();
  if (filters.databaseId != null && filters.tableName) {
    collection = appDb.rows.where('[databaseId+tableName]').equals([filters.databaseId, filters.tableName]);
  } else if (filters.databaseId != null) {
    collection = appDb.rows.where('databaseId').equals(filters.databaseId);
  }

  const matched: ImportedRow[] = [];
  let scanned = 0;
  let totalMatches = 0;
  let truncated = false;

  await collection.each((row) => {
    scanned++;
    if (scanned > MAX_ROWS_TO_SCAN) {
      truncated = true;
      return;
    }
    if (rowMatches(row, tokens, filters.column)) {
      totalMatches++;
      // نحتفظ فقط بالصفوف داخل نطاق الصفحة المطلوبة + هامش بسيط، توفيرًا للذاكرة
      if (matched.length < (page + 1) * pageSize) {
        matched.push(row);
      }
    }
  });

  const pageItems = matched.slice(page * pageSize, (page + 1) * pageSize).map((row) => ({
    row,
    databaseName: nameById.get(row.databaseId) ?? 'قاعدة بيانات محذوفة',
  }));

  return { items: pageItems, totalMatches, truncated };
}

/** يعيد كل الجداول المتاحة للفلترة، مجمّعة حسب قاعدة البيانات */
export async function getSearchableTables(): Promise<
  { database: ImportedDatabase; tables: ImportedTableSchema[] }[]
> {
  const databases = await appDb.databases.toArray();
  const result = [];
  for (const database of databases) {
    const tables = await appDb.tableSchemas.where('databaseId').equals(database.id as number).toArray();
    result.push({ database, tables });
  }
  return result;
}
