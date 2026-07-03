import { useEffect, useState } from 'react';
import {
  listImportedDatabases,
  requestPersistentStorage,
  estimateStorageUsage,
  deleteImportedDatabase,
  type ImportedDatabase,
} from './lib/db';
import { translations, getLanguage, setLanguage } from './lib/i18n'; // استيراد ملف اللغات
import ImportDialog from './ImportDialog';
import SearchScreen from './SearchScreen';
import DatabaseDetail from './DatabaseDetail';
import InstallPrompt from './InstallPrompt';
import './App.css';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPersistent, setIsPersistent] = useState<boolean | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ usageMB: number; quotaMB: number } | null>(null);
  const [databases, setDatabases] = useState<ImportedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailDb, setDetailDb] = useState<ImportedDatabase | null>(null);
const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  
  // تأمين جلب اللغة الابتدائية بشكل كامل لمنع انهيار الرندرة
  const [lang, setLangState] = useState(() => {
    try {
      return getLanguage() || 'ar';
    } catch (e) {
      return 'ar';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const currentLang = lang || 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    try {
      setLanguage(currentLang);
    } catch (e) {
      console.error("Failed to save language:", e);
    }
  }, [lang]);

  // حماية كائن الترجمات من الـ undefined
const t = translations && lang && translations[lang] ? translations[lang] : (translations?.ar || {});  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLang = () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoading(true);
    try {
      const [dbs, storage, persistent] = await Promise.all([
        listImportedDatabases(),
        estimateStorageUsage(),
        navigator.storage?.persisted ? navigator.storage.persisted() : Promise.resolve(null),
      ]);
      setDatabases(dbs);
      setStorageInfo(storage);
      setIsPersistent(persistent);
    } catch (error) {
      console.error("Error refreshing database info:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnablePersistence() {
    const granted = await requestPersistentStorage();
    setIsPersistent(granted);
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    if (!confirm(t.deleteConfirm)) return;
    await deleteImportedDatabase(id);
    await refreshAll();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <ellipse cx="12" cy="5" rx="8" ry="3" />
              <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
              <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
            </svg>
          </span>
          <div>
            <h1>{t.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* زر تبديل اللغة الجديد */}
          <button className="btn btn-ghost" onClick={toggleLang} style={{ padding: '6px 12px', fontSize: '14px' }}>
            {t.langToggle}
          </button>

          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            style={{ padding: '8px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className={`status-pill ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot" />
            {isOnline ? t.online : t.offline}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="panel panel-actions">
          <button className="btn btn-primary" onClick={() => setIsImportOpen(true)}>
            <PlusIcon />
            {t.importDb}
          </button>
          <button
            className="btn btn-secondary"
            disabled={databases.length === 0}
            title={databases.length === 0 ? t.importFirst : undefined}
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon />
            {t.globalSearch}
          </button>
          {databases.length === 0 && (
            <span className="coming-soon-note">{t.importFirst}</span>
          )}
        </section>

        <section className="panel">
          <div className="panel-title-row">
            <h2>{t.savedDbs}</h2>
            {databases.length > 0 && <span className="count-badge">{databases.length}</span>}
          </div>

          {loading ? (
            <div className="empty-state">
              <p>{t.loading}</p>
            </div>
          ) : databases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <ellipse cx="12" cy="5" rx="8" ry="3" />
                  <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                </svg>
              </div>
              <p className="empty-title">{t.noDbs}</p>
              <p className="empty-sub">{t.noDbsSub}</p>
            </div>
          ) : (
            <ul className="db-list">
              {databases.map((db) => (
                <li key={db.id} className="db-card" onClick={() => setDetailDb(db)}>
                  <div className="db-card-main">
                    <span className="db-type-tag">{db.sourceType.toUpperCase()}</span>
                    <div>
                      <p className="db-name">{db.name}</p>
                      <p className="db-meta">
                        {db.tableNames.length} {t.tables} · {db.totalRows.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} {t.rows}
                      </p>
                    </div>
                  </div>
                  <div className="db-card-end">
                    <p className="db-date">{new Date(db.importedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(db.id);
                      }}
                      aria-label="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel panel-storage">
          <h2>{t.storageStatus}</h2>
          <div className="storage-row">
            <span>{t.persistentStorage}</span>
            {isPersistent === null ? (
              <span className="tag tag-neutral">{t.storageSupported}</span>
            ) : isPersistent ? (
              <span className="tag tag-good">{t.storageEnabled}</span>
            ) : (
              <button className="btn btn-ghost" onClick={handleEnablePersistence}>
                {t.enableStorage}
              </button>
            )}
          </div>
          {storageInfo && (
            <div className="storage-row">
              <span>{t.usedSpace}</span>
              <span className="tag tag-neutral" dir="ltr">
                {storageInfo.usageMB.toFixed(1)} MB / {storageInfo.quotaMB.toFixed(0)} MB
              </span>
            </div>
          )}
        </section>
      </main>

      {isImportOpen && <ImportDialog onClose={() => setIsImportOpen(false)} onImported={refreshAll} />}
      {isSearchOpen && <SearchScreen onClose={() => setIsSearchOpen(false)} currentLang={lang} />}
      {detailDb && <DatabaseDetail database={detailDb} onClose={() => setDetailDb(null)} />}
    </div>
  );
}

// الأيقونات والدوال المساعدة تظل كما هي بالأسفل...
function PlusIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
// (بقية كود الأيقونات مستقر تماماً)
function SunIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>; }
