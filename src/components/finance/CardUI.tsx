import React from 'react';

type CardUIProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function CardUI({ children, className = '', onClick }: CardUIProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
