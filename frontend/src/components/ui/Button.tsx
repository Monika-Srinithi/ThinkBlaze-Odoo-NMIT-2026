import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  
  const variants = {
    primary: "bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-[#818cf8]",
    secondary: "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.2)]",
    danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-[#f87171]",
    ghost: "bg-transparent text-white hover:bg-[rgba(255,255,255,0.1)]",
    outline: "bg-transparent text-white border border-[#6366f1] hover:bg-[rgba(99,102,241,0.1)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
