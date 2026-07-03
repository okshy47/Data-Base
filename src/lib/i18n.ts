export const translations: Record<string, any> = {
  ar: {
    globalSearch: "البحث الشامل",
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
    of: "من",
    deleteConfirm: "هل أنت متأكد من حذف قاعدة البيانات هذه؟"
  },
  en: {
    globalSearch: "Global Search",
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
    of: "of",
    deleteConfirm: "Are you sure you want to delete this database?"
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
