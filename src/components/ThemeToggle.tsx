import React from 'react';
import { LogoTheme } from './Logo';

interface ThemeToggleProps {
  currentTheme: LogoTheme;
  onThemeChange: (theme: LogoTheme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.06)',
      padding: '10px 20px',
      borderRadius: '30px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      width: 'fit-content'
    }}>
      <span style={{ 
        color: currentTheme === 'light' ? '#0B1B3D' : '#FFFFFF', 
        fontSize: '13px', 
        direction: 'rtl', 
        fontFamily: 'system-ui, sans-serif',
        marginLeft: '5px' 
      }}>
        مظهر التطبيق:
      </span>
      
      {/* الأزرار الدائرية الملونة المخصصة للأوضاع الخمسة */}
      <button 
        onClick={() => onThemeChange('dark-blue')} 
        title="الوضع الليلي الفاخر" 
        style={{ width: '22px', height: '22px', borderRadius: '50%', border: currentTheme === 'dark-blue' ? '2px solid #FFF' : '2px solid transparent', background: '#030F26', cursor: 'pointer', transition: 'transform 0.2s' }} 
      />
      <button 
        onClick={() => onThemeChange('light')} 
        title="الوضع المضيء النقي" 
        style={{ width: '22px', height: '22px', borderRadius: '50%', border: currentTheme === 'light' ? '2px solid #0B1B3D' : '2px solid transparent', background: '#F4F6F9', cursor: 'pointer', transition: 'transform 0.2s' }} 
      />
      <button 
        onClick={() => onThemeChange('emerald')} 
        title="الوضع الزمردي المهني" 
        style={{ width: '22px', height: '22px', borderRadius: '50%', border: currentTheme === 'emerald' ? '2px solid #FFF' : '2px solid transparent', background: '#00E5A3', cursor: 'pointer', transition: 'transform 0.2s' }} 
      />
      <button 
        onClick={() => onThemeChange('charcoal')} 
        title="الوضع الفخم الكلاسيكي" 
        style={{ width: '22px', height: '22px', borderRadius: '50%', border: currentTheme === 'charcoal' ? '2px solid #FFF' : '2px solid transparent', background: '#D4AF37', cursor: 'pointer', transition: 'transform 0.2s' }} 
      />
      <button 
        onClick={() => onThemeChange('digital')} 
        title="الوضع الرقمي الحديث" 
        style={{ width: '22px', height: '22px', borderRadius: '50%', border: currentTheme === 'digital' ? '2px solid #FFF' : '2px solid transparent', background: 'linear-gradient(45deg, #A855F7, #00A3FF)', cursor: 'pointer', transition: 'transform 0.2s' }} 
      />
    </div>
  );
};
