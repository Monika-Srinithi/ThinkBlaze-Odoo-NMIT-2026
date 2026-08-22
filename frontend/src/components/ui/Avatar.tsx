import React from 'react';

export const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 40 }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  return (
    <div 
      className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
};
