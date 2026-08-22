import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <select
          ref={ref}
          className={clsx(
            "bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors",
            error && "border-rose-500",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1e1e2d] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
