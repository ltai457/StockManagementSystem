import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ 
  value, 
  onChange, 
  onClear,
  placeholder = "Search...", 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg w-full min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
