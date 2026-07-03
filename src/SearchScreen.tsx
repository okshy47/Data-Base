import { useEffect, useMemo, useState } from 'react';
import { searchRows, getSearchableTables, type SearchResultItem } from './lib/search';
import type { ImportedDatabase, ImportedTableSchema } from './lib/db';
import { translations, getLanguage } from './lib/i18n'; // استيراد محرك اللغات

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

  // جلب اللغة الحالية المحددة في التطبيق
  const lang = getLanguage();
  const t = translations[lang];

  useEffect(() => {
    getSearchableTables().then(setTableGroups);
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
      setItems(res.items);
      setTotalMatches(res.totalMatches);
      setTruncated(res.truncated);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t.globalSearch}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="search-input-row" style={{ position: 'relative' }}>
            <SearchGlyph />
            <input
              autoFocus
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                paddingLeft: lang === 'ar' ? (query ? '40px' : '12px') : '12px',
                paddingRight: lang === 'en' ? (query ? '40px' : '12px') : '12px'
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
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filters-row">
            <select
              className="filter-select"
              value={scope.databaseId ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setScope({ databaseId: val, tableName: null });
                setColumn(null);
              }}
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
            <div className="empty-state">
              <p className="empty-sub">{t.searchStart}</p>
            </div>
          )}

          {debouncedQuery.trim() && isSearching && (
            <div className="status-box">
              <div className="spinner" />
              <p>{t.searching}</p>
            </div>
          )}

          {debouncedQuery.trim() && !isSearching && items.length === 0 && (
            <div className="empty-state">
              <p className="empty-title">{t.noResults}</p>
              <p className="empty-sub">{t.noResultsSub}</p>
            </div>
          )}

          {debouncedQuery.trim() && !isSearching && items.length > 0 && (
            <>
              <p className="results-summary">
                {totalMatches.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} {t.resultsCount}
                {truncated && t.truncated}
              </p>

              <ul className="results-list">
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
                <div className="pagination">
                  <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    {t.prev}
                  </button>
                  <span className="pagination-label">
                    {t.page} {page + 1} {t.of} {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
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
    <li className="result-card">
      <div className="result-card-head">
        <span className="db-type-tag">{item.databaseName}</span>
        <span className="result-table-name">{item.row.tableName}</span>
      </div>
      <div className="result-fields">
        {Object.entries(item.row.data).map(([col, val]) => (
          <div key={col} className={`result-field ${col === highlightColumn ? 'result-field-hl' : ''}`}>
            <span className="result-field-key">{col}</span>
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
