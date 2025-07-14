import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlighted';
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ 
  label, 
  value, 
  subtitle, 
  icon,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const variantClasses = {
    default: 'bg-content-50',
    highlighted: 'bg-gradient-to-r from-content-50 to-content-100 border border-content-200'
  };

  return (
    <div className={`text-center ${variantClasses[variant]} rounded-lg p-3`}>
      {icon && (
        <div className="flex items-center justify-center mb-2">
          {icon}
        </div>
      )}
      <div className={`${sizeClasses[size]} font-bold text-content-900`}>
        {value}
      </div>
      <div className="text-content-600">{label}</div>
      {subtitle && (
        <div className="text-xs text-content-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}; 