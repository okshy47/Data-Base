import { useEffect, useState } from 'react';
import {
  getTableSchemas,
  getTableRowsPage,
  getAllTableRowData,
  countTableRows,
  type ImportedDatabase,
  type ImportedTableSchema,
  type ImportedRow,
} from './lib/db';
import { exportTableAsCsv, exportDatabaseAsExcel } from './lib/export';

const PAGE_SIZE = 25;

export default function DatabaseDetail({
  database,
  onClose,
}: {
  database: ImportedDatabase;
  onClose: () => void;
}) {
  const [schemas, setSchemas] = useState<ImportedTableSchema[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingRows, setLoadingRows] = useState(true);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingTable, setIsExportingTable] = useState(false);

  useEffect(() => {
    getTableSchemas(database.id as number).then((s) => {
      setSchemas(s);
      setActiveTable(s[0]?.tableName ?? null);
    });
  }, [database.id]);

  useEffect(() => {
    if (!activeTable) return;
    setPage(0);
  }, [activeTable]);

  useEffect(() => {
    if (!activeTable) return;
    let cancelled = false;
    setLoadingRows(true);
    Promise.all([
      getTableRowsPage(database.id as number, activeTable, page * PAGE_SIZE, PAGE_SIZE),
      countTableRows(database.id as number, activeTable),
    ]).then(([r, count]) => {
      if (cancelled) return;
      setRows(r);
      setRowCount(count);
      setLoadingRows(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTable, page, database.id]);

  const activeSchema = schemas.find((s) => s.tableName === activeTable);
  const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

  async function handleExportCurrentTable() {
    if (!activeTable) return;
    setIsExportingTable(true);
    try {
      const data = await getAllTableRowData(database.id as number, activeTable);
      await exportTableAsCsv(activeTable, data);
    } finally {
      setIsExportingTable(false);
    }
  }

  async function handleExportWholeDatabase() {
    setIsExportingAll(true);
    try {
      const tables = await Promise.all(
        schemas.map(async (schema) => ({
          schema,
          rows: await getAllTableRowData(database.id as number, schema.tableName),
        }))
      );
      await exportDatabaseAsExcel(database.name, tables);
    } finally {
      setIsExportingAll(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{database.name}</h2>
            <p className="detail-sub">
              {database.tableNames.length} جدول · {database.totalRows.toLocaleString('ar-EG')} صف إجمالًا
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-actions">
            <button className="btn btn-ghost" onClick={handleExportWholeDatabase} disabled={isExportingAll}>
              {isExportingAll ? 'جارِ التصدير...' : 'تصدير القاعدة كاملة (Excel)'}
            </button>
          </div>

          {schemas.length > 1 && (
            <div className="table-tabs">
              {schemas.map((s) => (
                <button
                  key={s.tableName}
                  className={`table-tab ${s.tableName === activeTable ? 'table-tab-active' : ''}`}
                  onClick={() => setActiveTable(s.tableName)}
                >
                  {s.tableName}
                </button>
              ))}
            </div>
          )}

          {activeSchema && (
            <>
              <div className="table-toolbar">
                <span className="table-toolbar-count">
                  {rowCount.toLocaleString('ar-EG')} صف · {activeSchema.columns.length} عمود
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleExportCurrentTable} disabled={isExportingTable}>
                  {isExportingTable ? 'جارِ التصدير...' : 'تصدير هذا الجدول (CSV)'}
                </button>
              </div>

              <div className="data-table-wrap">
                {loadingRows ? (
                  <div className="status-box">
                    <div className="spinner" />
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        {activeSchema.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          {activeSchema.columns.map((c) => (
                            <td key={c}>{row.data[c] === null || row.data[c] === undefined ? '—' : String(row.data[c])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    السابق
                  </button>
                  <span className="pagination-label">
                    صفحة {page + 1} من {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
