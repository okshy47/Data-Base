export const translations: Record<string, any> = {
  ar: {
    title: "نظام إدارة قواعد البيانات",
    langToggle: "English",
    themeLight: "الوضع المضيء",
    themeDark: "الوضع الداكن",
    online: "متصل",
    offline: "غير متصل",
    importDb: "استيراد قاعدة بيانات",
    globalSearch: "البحث الشامل",
    importFirst: "برجاء استيراد قاعدة بيانات أولاً للبحث",
    savedDbs: "قواعد البيانات المحفوظة",
    loading: "جاري التحميل...",
    noDbs: "لا توجد قواعد بيانات",
    noDbsSub: "قم برفع ملفاتك للبدء في إدارتها وفحصها.",
    tables: "جداول",
    rows: "صفوف",
    storageStatus: "حالة المساحة التخزينية",
    persistentStorage: "التخزين الدائم",
    storageSupported: "مدعوم",
    storageEnabled: "مفعّل",
    enableStorage: "تفعيل التخزين الدائم",
    usedSpace: "المساحة المستخدمة",
    deleteConfirm: "هل أنت متأكد من حذف قاعدة البيانات هذه؟",
    searchPlaceholder: "ابحث في جميع قواعد البيانات والجداول...",
    allDbs: "جميع قواعد البيانات",
    allTables: "جميع الجداول",
    allColumns: "جميع الأعمدة",
    searchStart: "اكتب كلمة البحث للبدء...",
    searching: "جاري البحث...",
    noResults: "لا توجد نتائج",
    noResultsSub: "جرّب كلمات مفتاحية أخرى أو غيّر فلاتر البحث.",
    resultsCount: "نتيجة مطابقة",
    truncated: " (تم عرض جزء من النتائج)",
    prev: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من"
  },
  en: {
    title: "Database Management System",
    langToggle: "العربية",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    online: "Online",
    offline: "Offline",
    importDb: "Import Database",
    globalSearch: "Global Search",
    importFirst: "Please import a database first to search",
    savedDbs: "Saved Databases",
    loading: "Loading...",
    noDbs: "No Databases",
    noDbsSub: "Upload your files to start managing and inspecting them.",
    tables: "tables",
    rows: "rows",
    storageStatus: "Storage Status",
    persistentStorage: "Persistent Storage",
    storageSupported: "Supported",
    storageEnabled: "Enabled",
    enableStorage: "Enable Persistent Storage",
    usedSpace: "Used Space",
    deleteConfirm: "Are you sure you want to delete this database?",
    searchPlaceholder: "Search across all databases and tables...",
    allDbs: "All Databases",
    allTables: "All Tables",
    allColumns: "All Columns",
    searchStart: "Type to start searching...",
    searching: "Searching...",
    noResults: "No results found",
    noResultsSub: "Try different keywords or adjust your filters.",
    resultsCount: "matching results",
    truncated: " (results truncated)",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of"
  }
};

export function getLanguage(): 'ar' | 'en' {
  try {
    const saved = localStorage.getItem('app-lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (e) {
    console.error(e);
  }
  return 'ar';
}

export function setLanguage(lang: 'ar' | 'en') {
  try {
    localStorage.setItem('app-lang', lang || 'ar');
  } catch (e) {
    console.error(e);
  }
}
