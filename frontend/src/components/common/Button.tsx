import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    // Primary: twilight-indigo
    primary: 'bg-[#3a405a] text-white hover:bg-[#2e3348] focus:ring-[#3a405a]',
    // Secondary: powder-blue
    secondary: 'bg-[#99b2dd] text-[#3a405a] font-semibold hover:bg-[#85a2d4] focus:ring-[#99b2dd]',
    // Accent / Alert: powder-blush
    accent: 'bg-[#e9afa3] text-[#3a405a] font-semibold hover:bg-[#e09b8d] focus:ring-[#e9afa3]',
    // Outline with ash-brown
    outline: 'border border-[#685044] text-[#3a405a] bg-transparent hover:bg-[#f9dec9]/50 focus:ring-[#685044]',
    // Danger
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
