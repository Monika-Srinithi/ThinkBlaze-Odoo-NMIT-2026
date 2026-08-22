import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  gradientBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, header, actions, gradientBorder }) => {
  return (
    <div className={clsx(
      "glass p-6",
      gradientBorder && "gradient-border",
      className
    )}>
      {(header || actions) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
          {header && <div className="text-lg font-semibold">{header}</div>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
