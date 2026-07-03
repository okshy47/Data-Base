import { useEffect, useState } from 'react';
import {
  listImportedDatabases,
  requestPersistentStorage,
  estimateStorageUsage,
  deleteImportedDatabase,
  type ImportedDatabase,
} from './lib/db';
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

  // إدارة الوضع الداكن والمضيء
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    const [dbs, storage, persistent] = await Promise.all([
      listImportedDatabases(),
      estimateStorageUsage(),
      navigator.storage?.persisted ? navigator.storage.persisted() : Promise.resolve(null),
    ]);
    setDatabases(dbs);
    setStorageInfo(storage);
    setIsPersistent(persistent);
    loading && setLoading(false);
  }

  async function handleEnablePersistence() {
    const granted = await requestPersistentStorage();
    setIsPersistent(granted);
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    if (!confirm('هل تريد حذف قاعدة البيانات هذه نهائيًا من جهازك؟')) return;
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
            <h1>مستكشف قواعد البيانات</h1>
            {/* تم إزالة الجملة الفرعية بنجاح من هنا لتبسيط التصميم */}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* زر التبديل بين الـ Dark والـ Light Mode */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? "التحول للوضع المضيء" : "التحول للوضع الداكن"}
            style={{ padding: '8px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className={`status-pill ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot" />
            {isOnline ? 'متصل' : 'غير متصل — يعمل بشكل طبيعي'}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="panel panel-actions">
          <button className="btn btn-primary" onClick={() => setIsImportOpen(true)}>
            <PlusIcon />
            استيراد قاعدة بيانات
          </button>
          <button
            className="btn btn-secondary"
            disabled={databases.length === 0}
            title={databases.length === 0 ? 'استورد قاعدة بيانات أولًا' : undefined}
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon />
            بحث شامل
          </button>
          {databases.length === 0 && (
            <span className="coming-soon-note">استورد قاعدة بيانات أولًا لتفعيل البحث</span>
          )}
        </section>

        <section className="panel">
          <div className="panel-title-row">
            <h2>قواعد البيانات المحفوظة</h2>
            {databases.length > 0 && <span className="count-badge">{databases.length}</span>}
          </div>

          {loading ? (
            <div className="empty-state">
              <p>جارِ التحميل...</p>
            </div>
          ) : databases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <ellipse cx="12" cy="5" rx="8" ry="3" />
                  <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                </svg>
              </div>
              <p className="empty-title">لا توجد قواعد بيانات محفوظة بعد</p>
              <p className="empty-sub">
                بعد تفعيل الاستيراد، ستظهر هنا كل قاعدة بيانات تضيفها (Excel، CSV، أو SQLite)
                وستبقى محفوظة على جهازك حتى بدون اتصال بالإنترنت.
              </p>
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
                        {db.tableNames.length} جدول · {db.totalRows.toLocaleString('ar-EG')} صف
                      </p>
                    </div>
                  </div>
                  <div className="db-card-end">
                    <p className="db-date">{new Date(db.importedAt).toLocaleString('ar-EG')}</p>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(db.id);
                      }}
                      aria-label="حذف"
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
          <h2>حالة التخزين على الجهاز</h2>
          <div className="storage-row">
            <span>التخزين الدائم</span>
            {isPersistent === null ? (
              <span className="tag tag-neutral">غير مدعوم في هذا المتصفح</span>
            ) : isPersistent ? (
              <span className="tag tag-good">مُفعّل — بياناتك محمية من الحذف التلقائي</span>
            ) : (
              <button className="btn btn-ghost" onClick={handleEnablePersistence}>
                تفعيل التخزين الدائم
              </button>
            )}
          </div>
          {storageInfo && (
            <div className="storage-row">
              <span>المساحة المستخدمة</span>
              <span className="tag tag-neutral" dir="ltr">
                {storageInfo.usageMB.toFixed(1)} MB / {storageInfo.quotaMB.toFixed(0)} MB
              </span>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <RoadmapStep label="التثبيت والعمل بدون إنترنت" done />
        <RoadmapStep label="استيراد قواعد البيانات" done />
        <RoadmapStep label="محرك البحث" done />
        <RoadmapStep label="اللمسات النهائية" done />
      </footer>

      <InstallPrompt />

      {isImportOpen && <ImportDialog onClose={() => setIsImportOpen(false)} onImported={refreshAll} />}
      {isSearchOpen && <SearchScreen onClose={() => setIsSearchOpen(false)} />}
      {detailDb && <DatabaseDetail database={detailDb} onClose={() => setDetailDb(null)} />}
    </div>
  );
}

function RoadmapStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`roadmap-step ${done ? 'roadmap-done' : ''}`}>
      <span className="roadmap-dot" />
      {label}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
