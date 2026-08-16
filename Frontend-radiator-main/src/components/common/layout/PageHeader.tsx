// @ts-nocheck
import React from 'react';

export const PageHeader = ({ 
  title, 
  subtitle,
  icon: Icon,
  actions,
  children 
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        {Icon && <Icon className="mt-0.5 h-6 w-6 flex-none text-blue-600" />}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};
