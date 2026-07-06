import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Logo, LogoTheme } from './components/Logo';

// --- مكون المودال المدمج لضمان أعلى توافق ---
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [localQuery, setLocalQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#1C232B', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid #00A3FF' }}>
        <h3 style={{ color: '#FFFFFF', marginTop: 0, marginBottom: '20px', textAlign: 'right' }}>البحث المتقدم</h3>
        <input 
          type="text" 
          value={localQuery} 
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="اكتب كلمات البحث هنا..." 
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0B1B3D', color: '#FFFFFF', boxSizing: 'border-box', marginBottom: '20px', textAlign: 'right' }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          <button onClick={() => { onSearch(localQuery); onClose(); }} style={{ backgroundColor: '#00A3FF', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>بحث</button>
          <button onClick={onClose} style={{ backgroundColor: '#334155', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي للشاشة ---
export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<LogoTheme>('dark-blue');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1B3D', color: '#FFFFFF', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
      {/* استدعاء اللوجو الموحد والمشترك */}
      <div style={{ marginBottom: '30px' }}>
        <Logo theme={currentTheme} size={140} showText={true} />
      </div>

      <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '30px', color: '#FFFFFF' }}>مستكشف البيانات الذكي</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '12px 24px', backgroundColor: '#00E5A3', color: '#0B1B3D', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            فتح محرك البحث
          </button>
          
          <select 
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value as LogoTheme)}
            style={{ padding: '12px', backgroundColor: '#1C232B', color: '#FFFFFF', border: '1px solid #00A3FF', borderRadius: '8px', cursor: 'pointer' }}
          >
            <option value="dark-blue">الأزرق الداكن</option>
            <option value="light">المضيء</option>
            <option value="emerald">الزمردي</option>
            <option value="charcoal">الفحمي الذهبي</option>
            <option value="digital">الرقمي</option>
          </select>
        </div>

        {searchQuery && (
          <div style={{ padding: '15px', backgroundColor: 'rgba(0, 163, 255, 0.1)', border: '1px solid #00A3FF', borderRadius: '8px', marginTop: '20px', textAlign: 'right' }}>
            <strong>آخر كلمة بحث:</strong> {searchQuery}
          </div>
        )}
      </div>

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSearch={handleSearch} 
      />
    </div>
  );
};

export default SearchScreen;
