/**
 * طبقة التخزين المحلي الدائم للتطبيق
 * ------------------------------------
 * تستخدم IndexedDB (عبر مكتبة Dexie) لتخزين قواعد البيانات التي يستوردها
 * المستخدم بشكل دائم على جهازه، بحيث تبقى متاحة للبحث حتى بدون اتصال
 * بالإنترنت وحتى بعد إغلاق التطبيق وإعادة فتحه.
 *
 * هذه الطبقة عامة (generic) بحيث تقبل أي قاعدة بيانات مستوردة بغض النظر
 * عن مصدرها (Excel / CSV / SQLite) بعد تحويلها لصيغة موحدة من
 * جداول (tables) وصفوف (rows).
 */

import Dexie, { type EntityTable } from 'dexie';

/** نوع مصدر قاعدة البيانات المستوردة */
export type ImportedSourceType = 'xlsx' | 'csv' | 'sqlite';

/** سجل يمثل قاعدة بيانات مستوردة واحدة (قد تحتوي على عدة جداول) */
export interface ImportedDatabase {
  id?: number;
  /** اسم يعرضه المستخدم لهذه القاعدة */
  name: string;
  /** نوع الملف الأصلي الذي تم الاستيراد منه */
  sourceType: ImportedSourceType;
  /** تاريخ ووقت الاستيراد */
  importedAt: string;
  /** حجم الملف الأصلي بالبايت (للعرض فقط) */
  fileSizeBytes: number;
  /** أسماء الجداول الموجودة داخل هذه القاعدة */
  tableNames: string[];
  /** إجمالي عدد الصفوف في كل الجداول (للعرض في لوحة المعلومات) */
  totalRows: number;
}

/** وصف بنية جدول واحد داخل قاعدة بيانات مستوردة */
export interface ImportedTableSchema {
  id?: number;
  /** المفتاح الأجنبي لقاعدة البيانات الأصلية */
  databaseId: number;
  /** اسم الجدول */
  tableName: string;
  /** أسماء الأعمدة بترتيبها الأصلي */
  columns: string[];
  /** عدد الصفوف في هذا الجدول تحديدًا */
  rowCount: number;
}

/** صف بيانات واحد من أحد الجداول المستوردة */
export interface ImportedRow {
  id?: number;
  databaseId: number;
  tableName: string;
  /** رقم الصف الأصلي (للحفاظ على الترتيب) */
  rowIndex: number;
  /** بيانات الصف كـ كائن {عمود: قيمة} */
  data: Record<string, string | number | boolean | null>;
  /**
   * نص مُجمَّع من كل قيم الصف مفصولة بمسافات، محوّل لحروف صغيرة،
   * يُستخدم كفهرس للبحث النصي السريع عبر كل الأعمدة دفعة واحدة.
   */
  searchBlob: string;
}

class AppDatabase extends Dexie {
  databases!: EntityTable<ImportedDatabase, 'id'>;
  tableSchemas!: EntityTable<ImportedTableSchema, 'id'>;
  rows!: EntityTable<ImportedRow, 'id'>;

  constructor() {
    super('DBExplorerAppStorage');

    this.version(1).stores({
      // ++id = مفتاح أساسي تلقائي الزيادة
      databases: '++id, name, importedAt',
      tableSchemas: '++id, databaseId, [databaseId+tableName]',
      // فهرسة databaseId و tableName و [databaseId+tableName] لتسريع الاستعلامات
      // و searchBlob لا يمكن فهرسته بالكامل كنص حر في IndexedDB، لذلك البحث
      // سيتم عبر مسح الصفوف المرتبطة بقاعدة/جدول معين (سيُبنى في الجولة القادمة).
      rows: '++id, databaseId, tableName, [databaseId+tableName], rowIndex',
    });
  }
}

export const appDb = new AppDatabase();

/** يبني نص searchBlob من صف بيانات لتسهيل البحث النصي لاحقًا */
export function buildSearchBlob(data: Record<string, unknown>): string {
  return Object.values(data)
    .map((v) => (v === null || v === undefined ? '' : String(v)))
    .join(' ')
    .toLowerCase();
}

/**
 * يحفظ قاعدة بيانات مستوردة بالكامل (البيانات الوصفية + الجداول + الصفوف)
 * في التخزين المحلي الدائم دفعة واحدة.
 */
export async function saveImportedDatabase(params: {
  name: string;
  sourceType: ImportedSourceType;
  fileSizeBytes: number;
  tables: { tableName: string; columns: string[]; rows: Record<string, unknown>[] }[];
}): Promise<number> {
  const { name, sourceType, fileSizeBytes, tables } = params;
  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);

  return appDb.transaction('rw', appDb.databases, appDb.tableSchemas, appDb.rows, async () => {
    const databaseId = (await appDb.databases.add({
      name,
      sourceType,
      importedAt: new Date().toISOString(),
      fileSizeBytes,
      tableNames: tables.map((t) => t.tableName),
      totalRows,
    })) as number;

    for (const table of tables) {
      await appDb.tableSchemas.add({
        databaseId,
        tableName: table.tableName,
        columns: table.columns,
        rowCount: table.rows.length,
      });

      const rowsToInsert: Omit<ImportedRow, 'id'>[] = table.rows.map((data, idx) => ({
        databaseId,
        tableName: table.tableName,
        rowIndex: idx,
        data: data as Record<string, string | number | boolean | null>,
        searchBlob: buildSearchBlob(data),
      }));

      // إدخال بالجملة (bulk) أسرع بكثير من الإدخال صفًا بصف لقواعد البيانات الكبيرة
      await appDb.rows.bulkAdd(rowsToInsert);
    }

    return databaseId;
  });
}

/** يعيد كل قواعد البيانات المستوردة المخزنة محليًا، الأحدث أولًا */
export async function listImportedDatabases(): Promise<ImportedDatabase[]> {
  return appDb.databases.orderBy('importedAt').reverse().toArray();
}

/** يعيد وصف جداول قاعدة بيانات معينة */
export async function getTableSchemas(databaseId: number): Promise<ImportedTableSchema[]> {
  return appDb.tableSchemas.where('databaseId').equals(databaseId).toArray();
}

/** يحذف قاعدة بيانات مستوردة بالكامل (البيانات الوصفية + الجداول + الصفوف) */
export async function deleteImportedDatabase(databaseId: number): Promise<void> {
  await appDb.transaction('rw', appDb.databases, appDb.tableSchemas, appDb.rows, async () => {
    await appDb.rows.where('databaseId').equals(databaseId).delete();
    await appDb.tableSchemas.where('databaseId').equals(databaseId).delete();
    await appDb.databases.delete(databaseId);
  });
}

/** يعيد إجمالي المساحة التقريبية المستخدمة (لعرضها للمستخدم إن أراد) */
export async function estimateStorageUsage(): Promise<{ usageMB: number; quotaMB: number } | null> {
  if (!('storage' in navigator) || !navigator.storage.estimate) return null;
  const estimate = await navigator.storage.estimate();
  return {
    usageMB: (estimate.usage ?? 0) / (1024 * 1024),
    quotaMB: (estimate.quota ?? 0) / (1024 * 1024),
  };
}

/** يعيد صفوف جدول معين مقسّمة على صفحات، مرتبة بترتيبها الأصلي */
export async function getTableRowsPage(
  databaseId: number,
  tableName: string,
  offset: number,
  limit: number
): Promise<ImportedRow[]> {
  return appDb.rows
    .where('[databaseId+tableName]')
    .equals([databaseId, tableName])
    .offset(offset)
    .limit(limit)
    .sortBy('rowIndex');
}

/** يعيد كل بيانات جدول معين دفعة واحدة (للتصدير) كمصفوفة كائنات {عمود: قيمة} */
export async function getAllTableRowData(
  databaseId: number,
  tableName: string
): Promise<Record<string, unknown>[]> {
  const rows = await appDb.rows.where('[databaseId+tableName]').equals([databaseId, tableName]).sortBy('rowIndex');
  return rows.map((r) => r.data);
}

/** يعيد إجمالي عدد صفوف جدول معين (لحساب عدد الصفحات) */
export async function countTableRows(databaseId: number, tableName: string): Promise<number> {
  return appDb.rows.where('[databaseId+tableName]').equals([databaseId, tableName]).count();
}

/**
 * يطلب من المتصفح تثبيت تخزين "دائم" (persistent) بحيث لا يقوم النظام
 * بمسح بيانات IndexedDB تلقائيًا عند ضغط المساحة (مهم جدًا لعمل التطبيق
 * بدون إنترنت بشكل موثوق على المدى الطويل).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !navigator.storage.persist) return false;
  return navigator.storage.persist();
}
