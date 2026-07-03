import { useRef, useState } from 'react';
import { parseImportedFile, SUPPORTED_EXTENSIONS, UnsupportedFileError, type ParseResult } from './lib/file-parsers';
import { saveImportedDatabase } from './lib/db';

type Stage =
  | { kind: 'idle' }
  | { kind: 'reading'; fileName: string }
  | { kind: 'preview'; fileName: string; fileSizeBytes: number; result: ParseResult }
  | { kind: 'saving'; fileName: string }
  | { kind: 'error'; message: string }
  | { kind: 'done'; fileName: string };

export default function ImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [stage, setStage] = useState<Stage>({ kind: 'idle' });
  const [customName, setCustomName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStage({ kind: 'reading', fileName: file.name });
    try {
      const result = await parseImportedFile(file);
      if (result.tables.every((t) => t.rows.length === 0)) {
        setStage({ kind: 'error', message: 'لم يتم العثور على أي بيانات قابلة للقراءة داخل هذا الملف.' });
        return;
      }
      setCustomName(file.name.replace(/\.[^.]+$/, ''));
      setStage({ kind: 'preview', fileName: file.name, fileSizeBytes: file.size, result });
    } catch (err) {
      if (err instanceof UnsupportedFileError) {
        setStage({ kind: 'error', message: err.message });
      } else {
        console.error(err);
        setStage({
          kind: 'error',
          message: 'تعذّرت قراءة الملف. تأكد أنه غير تالف وأنه بنفس الصيغة المذكورة في اسمه.',
        });
      }
    }
  }

  async function handleConfirmSave() {
    if (stage.kind !== 'preview') return;
    setStage({ kind: 'saving', fileName: stage.fileName });
    try {
      await saveImportedDatabase({
        name: customName.trim() || stage.fileName,
        sourceType: stage.result.sourceType,
        fileSizeBytes: stage.fileSizeBytes,
        tables: stage.result.tables,
      });
      setStage({ kind: 'done', fileName: stage.fileName });
      onImported();
    } catch (err) {
      console.error(err);
      setStage({ kind: 'error', message: 'حدث خطأ أثناء حفظ البيانات على الجهاز. حاول مرة أخرى.' });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>استيراد قاعدة بيانات</h2>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {stage.kind === 'idle' && (
            <>
              <div
                className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <UploadIcon />
                <p className="dropzone-title">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="dropzone-sub" dir="ltr">
                  {SUPPORTED_EXTENSIONS.join('  ·  ')}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={SUPPORTED_EXTENSIONS.join(',')}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <div className="access-note">
                <strong>ملاحظة عن ملفات Access (.mdb / .accdb):</strong>
                <span>
                  {' '}
                  لا يمكن قراءتها مباشرة داخل المتصفح لأسباب تقنية. افتح الملف في برنامج Access، ثم استخدم
                  "تصدير" لحفظه بصيغة Excel (.xlsx) أو حوّله إلى SQLite بأداة تحويل مجانية، ثم استورد الملف الناتج هنا.
                </span>
              </div>
            </>
          )}

          {stage.kind === 'reading' && (
            <div className="status-box">
              <Spinner />
              <p>جارِ قراءة الملف «{stage.fileName}»...</p>
            </div>
          )}

          {stage.kind === 'preview' && (
            <div className="preview-box">
              <label className="field-label" htmlFor="db-name-input">
                اسم قاعدة البيانات
              </label>
              <input
                id="db-name-input"
                className="text-input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="اسم تعرف به هذه القاعدة"
              />

              <p className="field-label" style={{ marginTop: 16 }}>
                الجداول المكتشفة ({stage.result.tables.length})
              </p>
              <ul className="preview-table-list">
                {stage.result.tables.map((t) => (
                  <li key={t.tableName} className="preview-table-item">
                    <span className="preview-table-name">{t.tableName}</span>
                    <span className="preview-table-meta">
                      {t.columns.length} عمود · {t.rows.length.toLocaleString('ar-EG')} صف
                    </span>
                  </li>
                ))}
              </ul>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setStage({ kind: 'idle' })}>
                  اختيار ملف آخر
                </button>
                <button className="btn btn-primary" onClick={handleConfirmSave}>
                  حفظ على الجهاز
                </button>
              </div>
            </div>
          )}

          {stage.kind === 'saving' && (
            <div className="status-box">
              <Spinner />
              <p>جارِ الحفظ على جهازك...</p>
            </div>
          )}

          {stage.kind === 'done' && (
            <div className="status-box status-success">
              <CheckIcon />
              <p>تم استيراد «{stage.fileName}» وحفظها بنجاح على جهازك.</p>
              <button className="btn btn-primary" onClick={onClose}>
                تم
              </button>
            </div>
          )}

          {stage.kind === 'error' && (
            <div className="status-box status-error">
              <ErrorIcon />
              <p>{stage.message}</p>
              <button className="btn btn-secondary" onClick={() => setStage({ kind: 'idle' })}>
                المحاولة مرة أخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function Spinner() {
  return <div className="spinner" />;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}
