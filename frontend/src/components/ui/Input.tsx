import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <input
          ref={ref}
          className={clsx(
            "bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-400">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
