import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// إعداد بدائل require التقليدية لتتوافق مع ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // إخفاء قائمة القوائم الافتراضية
  Menu.setApplicationMenu(null);

  // تحميل ملف الواجهة المبني بواسطة Vite
  // electron-builder يقوم بوضع الملفات في مجلد dist عند البناء للإنتاج
  const indexPath = path.join(__dirname, '../dist/index.html');
  win.loadFile(indexPath).catch(() => {
    // في بيئة التطوير المحلية إذا لم يجد الملف
    win.loadURL('http://localhost:5173');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
