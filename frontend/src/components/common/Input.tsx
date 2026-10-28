import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-[#3a405a] mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[#3a405a] bg-white placeholder-[#685044]/50 focus:outline-none focus:ring-2 focus:ring-[#99b2dd] transition-colors shadow-sm ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#685044]/30 focus:border-[#99b2dd]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#685044]/80">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
