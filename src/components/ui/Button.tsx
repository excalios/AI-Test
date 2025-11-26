import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'icon';
  title?: string;
  as?: 'button' | 'div';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  size = 'md', 
  title = '',
  as = 'button'
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500",
    ghost: "hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
  };
  const sizes = { sm: "h-7 px-2 text-xs", md: "h-9 px-3 text-sm", icon: "h-8 w-8 p-0" };
  
  const Component = as as any;

  return (
    <Component 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
    >
      {children}
    </Component>
  );
};
