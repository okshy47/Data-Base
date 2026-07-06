// src/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { performSearch } from './lib/search';

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // تقنية انتظار المستخدم لينتهي من الكتابة (debounce)
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim()) {
        const data = await performSearch(query);
        setResults(data);
      } else {
        setResults([]);
      }
    }, 500); // ينتظر نصف ثانية بعد آخر حرف تم كتابته

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div>
      <input 
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="ابحث هنا..." 
      />
      <ul>
        {results.map((item: any) => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
};
