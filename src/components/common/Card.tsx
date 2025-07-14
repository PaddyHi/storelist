import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  variant?: 'default' | 'gradient' | 'flat';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  minHeight,
  variant = 'default',
  onClick 
}) => {
  const baseClasses = 'transition-all duration-300 hover:bg-white flex flex-col';
  
  const variantClasses = {
    default: 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-content-200/50 p-8 hover:shadow-2xl',
    gradient: 'bg-gradient-to-br from-content-50 to-content-100 border-content-200 rounded-2xl shadow-xl border p-8 hover:shadow-2xl',
    flat: 'bg-white rounded-xl shadow-sm border border-content-200 p-6 hover:shadow-md',
  };

  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  const style = minHeight ? { minHeight } : undefined;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={combinedClassName}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Component>
  );
}; 