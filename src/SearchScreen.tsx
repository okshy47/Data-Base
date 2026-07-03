import { useEffect, useMemo, useState } from 'react';
import { searchRows, getSearchableTables, type SearchResultItem } from './lib/search';
import type { ImportedDatabase, ImportedTableSchema } from './lib/db';
import { translations, getLanguage } from './lib/i18n'; 

const PAGE_SIZE = 50;

export default function SearchScreen({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [scope, setScope] = useState<{ databaseId: number | null; tableName: string | null }>({
    databaseId: null,
    tableName: null,
  });
  const [column, setColumn] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tableGroups, setTableGroups] = useState<{ database: ImportedDatabase; tables: ImportedTableSchema[] }[]>([]);

  // تأمين جلب اللغة والترجمات لمنع ظهور الشاشة السوداء
  const lang = getLanguage() || 'ar';
  const t = translations[lang] || translations['ar'];

  useEffect(() => {
    getSearchableTables().then(setTableGroups).catch(err => console.error("Error loading tables:", err));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, scope, column]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setItems([]);
      setTotalMatches(0);
      setTruncated(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchRows(
      { query: debouncedQuery, databaseId: scope.databaseId, tableName: scope.tableName, column },
      page,
      PAGE_SIZE
    ).then((res) => {
      if (cancelled) return;
      setItems(res?.items || []);
      setTotalMatches(res?.totalMatches || 0);
      setTruncated(res?.truncated || false);
      setIsSearching(false);
    }).catch(err => {
      console.error("Search error:", err);
      setIsSearching(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, scope, column, page]);

  const activeColumns = useMemo(() => {
    if (scope.databaseId == null) return [];
    const group = tableGroups.find((g) => g.database.id === scope.databaseId);
    if (!group) return [];
    if (scope.tableName) {
      return group.tables.find((t) => t.tableName === scope.tableName)?.columns ?? [];
    }
    return Array.from(new Set(group.tables.flatMap((t) => t.columns)));
  }, [scope, tableGroups]);

  const totalPages = Math.max(1, Math.ceil(totalMatches / PAGE_SIZE));

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'grid', placeItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-panel, #1e293b)', borderRadius: '8px', width: '90%', maxWidth: '1000px', padding: '20px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{t.globalSearch}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-main)' }}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="search-input-row" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'en' ? '12px' : 'auto', display: 'grid', placeItems: 'center' }}>
              <SearchGlyph />
            </div>
            <input
              autoFocus
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: lang === 'ar' ? '40px' : '12px',
                paddingLeft: lang === 'en' ? '40px' : '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #334155)',
                background: 'var(--bg-input, #0f172a)',
                color: 'var(--text-main, #f8fafc)'
              }}
            />
            {query && (
              <button 
                className="clear-search-btn"
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  left: lang === 'ar' ? '12px' : 'auto',
                  right: lang === 'en' ? '12px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filters-row" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select
              className="filter-select"
              value={scope.databaseId ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setScope({ databaseId: val, tableName: null });
                setColumn(null);
              }}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="">{t.allDbs}</option>
              {tableGroups.map(({ database }) => (
                <option key={database.id} value={database.id}>
                  {database.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={scope.tableName ?? ''}
              disabled={scope.databaseId == null}
              onChange={(e) => {
                setScope((s) => ({ ...s, tableName: e.target.value || null }));
                setColumn(null);
              }}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="">{t.allTables}</option>
              {tableGroups
                .find((g) => g.database.id === scope.databaseId)
                ?.tables.map((t) => (
                  <option key={t.tableName} value={t.tableName}>
                    {t.tableName}
                  </option>
                ))}
            </select>

            <select
              className="filter-select"
              value={column ?? ''}
              disabled={activeColumns.length === 0}
              onChange={(e) => setColumn(e.target.value || null)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="">{t.allColumns}</option>
              {activeColumns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {!debouncedQuery.trim() && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4px' }}>
              <p className="empty-sub">{t.searchStart}</p>
            </div>
          )}

          {debouncedQuery.trim() && isSearching && (
            <div className="status-box" style={{ textAlign: 'center', padding: '20px' }}>
              <p>{t.searching}</p>
            </div>
          )}

          {debouncedQuery.trim() && !isSearching && items.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
              <p className="empty-title">{t.noResults}</p>
              <p className="empty-sub">{t.noResultsSub}</p>
            </div>
          )}

          {debouncedQuery.trim() && !isSearching && items.length > 0 && (
            <>
              <p className="results-summary" style={{ marginBottom: '10px' }}>
                {totalMatches.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} {t.resultsCount}
                {truncated && t.truncated}
              </p>

              <ul className="results-list" style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <ResultCard 
                    key={item.row.id} 
                    item={item} 
                    highlightColumn={column} 
                    query={debouncedQuery} 
                  />
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                  <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    {t.prev}
                  </button>
                  <span className="pagination-label">
                    {t.page} {page + 1} {t.of} {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t.next}
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

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  try {
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: 'rgba(255, 213, 0, 0.3)', color: 'inherit', padding: '0 2px', borderRadius: '2px' }}>{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (e) {
    return <>{text}</>;
  }
}

function ResultCard({
  item,
  highlightColumn,
  query,
}: {
  item: SearchResultItem;
  highlightColumn: string | null;
  query: string;
}) {
  return (
    <li className="result-card" style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
      <div className="result-card-head" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
        <span className="db-type-tag" style={{ fontSize: '12px', padding: '2px 6px', background: '#3b82f6', borderRadius: '4px' }}>{item.databaseName}</span>
        <span className="result-table-name" style={{ fontWeight: 'bold' }}>{item.row.tableName}</span>
      </div>
      <div className="result-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {Object.entries(item.row.data).map(([col, val]) => (
          <div key={col} className={`result-field ${col === highlightColumn ? 'result-field-hl' : ''}`} style={{ background: col === highlightColumn ? 'rgba(59, 130, 246, 0.1)' : 'none', padding: '4px', borderRadius: '4px' }}>
            <span className="result-field-key" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{col}</span>
            <span className="result-field-val">
              {val === null || val === '' ? '—' : <HighlightedText text={String(val)} highlight={query} />}
            </span>
          </div>
        ))}
      </div>
    </li>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
