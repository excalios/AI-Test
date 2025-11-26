import React from 'react';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    {label && <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  </div>
);
