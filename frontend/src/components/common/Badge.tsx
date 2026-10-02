import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantClasses = {
    emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border border-amber-200',
    rose: 'bg-rose-100 text-rose-800 border border-rose-200',
    blue: 'bg-sky-100 text-sky-800 border border-sky-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide capitalize ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};
