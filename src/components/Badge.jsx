import React from 'react';

// === ICONS ===
const CheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5} 
    stroke="currentColor" 
    className="w-3.5 h-3.5"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  </svg>
);

const Badge = ({ children, icon: Icon, className = '' }) => {
  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 
        px-3 py-1.5 rounded-full 
        text-xs font-semibold tracking-wide uppercase
        bg-teal-100 text-teal-800 
        ${className}
      `}
    >
      {Icon && <Icon />}
      {children}
    </div>
  );
};

export default Badge;
