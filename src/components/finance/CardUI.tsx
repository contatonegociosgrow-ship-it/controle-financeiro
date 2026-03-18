import React from 'react';

type CardUIProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
};

export function CardUI({ 
  children, 
  className = '', 
  onClick,
  variant = 'default'
}: CardUIProps) {
  const variantClasses = {
    default: 'glassmorphism',
    elevated: 'glassmorphism-strong',
    outlined: 'glassmorphism border-2 border-white/25',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
