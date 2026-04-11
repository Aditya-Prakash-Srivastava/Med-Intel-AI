import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = `
    inline-flex items-center justify-center 
    font-semibold rounded-lg 
    transition-all duration-200 
    px-6 py-2.5 text-sm
  `;
  
  const variantStyles = {
    primary: "bg-[#1E293B] text-white hover:bg-slate-800 shadow-md",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    white: "bg-white text-slate-900 hover:bg-gray-50 shadow-sm",
  };

  return (
    <button 
      className={`${baseClasses} ${variantStyles[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
