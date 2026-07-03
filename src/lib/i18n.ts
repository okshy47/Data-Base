export const translations = {
  ar: {
    title: "مستكشف قواعد البيانات",
    importDb: "استيراد قاعدة بيانات",
    globalSearch: "بحث شامل",
    importFirst: "استورد قاعدة بيانات أولًا لتفعيل البحث",
    savedDbs: "قواعد البيانات المحفوظة",
    loading: "جارِ التحميل...",
    noDbs: "لا توجد قواعد بيانات محفوظة بعد",
    noDbsSub: "بعد تفعيل الاستيراد، ستظهر هنا كل قاعدة بيانات تضيفها (Excel، CSV، أو SQLite) وستبقى محفوظة على جهازك حتى بدون اتصال بالإنترنت.",
    tables: "جدول",
    rows: "صف",
    deleteConfirm: "هل تريد حذف قاعدة البيانات هذه نهائيًا من جهازك؟",
    storageStatus: "حالة التخزين على الجهاز",
    persistentStorage: "التخزين الدائم",
    storageSupported: "غير مدعوم في هذا المتصفح",
    storageEnabled: "مُفعّل — بياناتك محمية من الحذف التلقائي",
    enableStorage: "تفعيل التخزين الدائم",
    usedSpace: "المساحة المستخدمة",
    online: "متصل",
    offline: "غير متصل — يعمل بشكل طبيعي",
    searchPlaceholder: "اكتب كلمة أو أكثر للبحث في كل قواعد بياناتك...",
    allDbs: "كل قواعد البيانات",
    allTables: "كل الجداول",
    allColumns: "كل الأعمدة",
    noResults: "لا توجد نتائج مطابقة",
    noResultsSub: "جرّب كلمات أقل أو تحقق من اختيار الأعمدة والفلاتر.",
    searchStart: "اكتب كلمة بحث للبدء. يمكنك تضييق النطاق باستخدام الفلاتر أعلاه.",
    searching: "جارِ البحث والتحقق من الجداول...",
    resultsCount: "نتيجة مطابقة",
    truncated: " (تم فحص جزء من البيانات الحالية فقط لضخامة حجم الملف)",
    prev: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
    themeDark: "التحول للوضع الداكن",
    themeLight: "التحول للوضع المضيء",
    langToggle: "English"
  },
  en: {
    title: "Database Explorer",
    importDb: "Import Database",
    globalSearch: "Global Search",
    importFirst: "Import a database first to enable search",
    savedDbs: "Saved Databases",
    loading: "Loading...",
    noDbs: "No databases saved yet",
    noDbsSub: "Once imported, your databases (Excel, CSV, or SQLite) will appear here and remain saved on your device, even offline.",
    tables: "tables",
    rows: "rows",
    deleteConfirm: "Are you sure you want to permanently delete this database?",
    storageStatus: "Device Storage Status",
    persistentStorage: "Persistent Storage",
    storageSupported: "Not supported in this browser",
    storageEnabled: "Enabled — your data is safe from automatic deletion",
    enableStorage: "Enable Persistent Storage",
    usedSpace: "Used Space",
    online: "Online",
    offline: "Offline — Working normally",
    searchPlaceholder: "Type one or more words to search across all databases...",
    allDbs: "All Databases",
    allTables: "All Tables",
    allColumns: "All Columns",
    noResults: "No matching results",
    noResultsSub: "Try fewer words or check your selected columns and filters.",
    searchStart: "Type a search query to begin. You can narrow down using filters above.",
    searching: "Searching and verifying tables...",
    resultsCount: "matching results",
    truncated: " (Only part of the data was scanned due to its massive size)",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    themeDark: "Switch to Dark Mode",
    themeLight: "Switch to Light Mode",
    langToggle: "العربية"
  }
};

type Lang = 'ar' | 'en';

export function getLanguage(): Lang {
  return (localStorage.getItem('app-lang') as Lang) || 'ar';
}

export function setLanguage(lang: Lang) {
  localStorage.setItem('app-lang', lang);
}
