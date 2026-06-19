import React from 'react';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  if (!title && !actions) return null;
  
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        {title && <h1 className="page-title text-2xl font-bold text-dark">{title}</h1>}
        {subtitle && <p className="page-subtitle text-dark/60 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
