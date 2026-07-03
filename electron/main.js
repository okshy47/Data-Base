// عملية Electron الرئيسية (Main Process)
// -----------------------------------------
// تفتح نافذة سطح مكتب تعرض التطبيق (dist/index.html) مباشرة من القرص —
// بدون أي خادم، بدون إنترنت، وبدون أي نافذة CMD/طرفية تظهر للمستخدم.

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

// إخفاء قائمة القوائم الافتراضية (File/Edit/View...) لأن التطبيق مخصص
// وليس بحاجة لها؛ يمكن حذف هذا السطر لو رغب المستخدم لاحقًا في قائمة مطوّرين
Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 640,
    backgroundColor: '#0b1220',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // لا حاجة لـ preload حاليًا لأن التطبيق لا يتواصل مع Node مباشرة
    },
  });

  // تحميل الملفات المبنية من dist/ مباشرة من القرص (بروتوكول file://)
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // أي رابط خارجي (لو أُضيف مستقبلًا) يُفتح في متصفح النظام بدل نافذة التطبيق
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
