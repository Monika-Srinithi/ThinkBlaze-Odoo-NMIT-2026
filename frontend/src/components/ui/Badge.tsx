import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    default: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  };

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center", variants[variant], className)}>
      {children}
    </span>
  );
};
