import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// تسجيل الـ Service Worker لتفعيل العمل بدون اتصال بالإنترنت وإمكانية التثبيت
// (غير مدعوم أو غير مطلوب داخل تطبيق Electron الذي يحمّل الملفات عبر file://)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
