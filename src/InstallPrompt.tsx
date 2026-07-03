import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // @ts-expect-error خاصية غير قياسية موجودة في Safari على iOS فقط
    window.navigator.standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('install-banner-dismissed') === '1');

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (installed || dismissed) return null;
  // نظهر البانر فقط لو عندنا وسيلة تثبيت فعلية: إما prompt جاهز (Android/Desktop Chrome)
  // أو متصفح iOS (نعرض له تعليمات يدوية لأن Safari لا يدعم beforeinstallprompt)
  if (!deferredPrompt && !isIOS()) return null;

  function dismiss() {
    sessionStorage.setItem('install-banner-dismissed', '1');
    setDismissed(true);
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIOS()) {
      setShowIOSHelp(true);
    }
  }

  return (
    <>
      <div className="install-banner">
        <div className="install-banner-text">
          <strong>ثبّت التطبيق على جهازك</strong>
          <span>يعمل بعدها بدون إنترنت مثل أي تطبيق عادي</span>
        </div>
        <div className="install-banner-actions">
          <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
            تثبيت
          </button>
          <button className="icon-btn" onClick={dismiss} aria-label="إغلاق">
            ✕
          </button>
        </div>
      </div>

      {showIOSHelp && (
        <div className="modal-overlay" onClick={() => setShowIOSHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>التثبيت على آيفون / آيباد</h2>
              <button className="icon-btn" onClick={() => setShowIOSHelp(false)} aria-label="إغلاق">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ol className="ios-steps">
                <li>
                  اضغط زر <strong>المشاركة</strong> <ShareIcon /> في شريط Safari السفلي
                </li>
                <li>
                  مرّر لأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية"</strong>
                </li>
                <li>
                  اضغط <strong>"إضافة"</strong> أعلى الشاشة
                </li>
              </ol>
              <p className="empty-sub" style={{ marginTop: 12 }}>
                بعدها ستجد أيقونة التطبيق على شاشتك الرئيسية، ويعمل بدون إنترنت مثل أي تطبيق آخر.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ verticalAlign: 'middle', margin: '0 2px' }}
    >
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}
