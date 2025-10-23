import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveId,
  activeId: controlledActiveId,
  onChange,
  variant = 'default',
  className,
}) => {
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId || items[0]?.id
  );

  const activeId = controlledActiveId ?? internalActiveId;
  const activeItem = items.find(item => item.id === activeId);

  const handleTabClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && !item.disabled) {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      onChange?.(id);
    }
  };

  const getTabClasses = (item: TabItem, isActive: boolean) => {
    const baseClasses = 'flex items-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    if (variant === 'pills') {
      return clsx(
        baseClasses,
        'rounded-md',
        isActive
          ? 'bg-blue-600 text-white'
          : item.disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
      );
    }
    
    if (variant === 'underline') {
      return clsx(
        baseClasses,
        'border-b-2 -mb-px',
        isActive
          ? 'border-blue-600 text-blue-600'
          : item.disabled
          ? 'border-transparent text-gray-400 cursor-not-allowed'
          : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 cursor-pointer'
      );
    }
    
    // Default variant
    return clsx(
      baseClasses,
      'border border-gray-300 -mb-px',
      isActive
        ? 'bg-white border-gray-300 border-b-white text-gray-900'
        : item.disabled
        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
        : 'bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer',
      'first:rounded-tl-md last:rounded-tr-md'
    );
  };

  const getTabListClasses = () => {
    if (variant === 'pills') {
      return 'flex space-x-1 bg-gray-100 p-1 rounded-lg';
    }
    
    if (variant === 'underline') {
      return 'flex space-x-8 border-b border-gray-200';
    }
    
    // Default variant
    return 'flex border-b border-gray-300';
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className={getTabListClasses()} role="tablist">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              className={getTabClasses(item, isActive)}
              onClick={() => handleTabClick(item.id)}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className="mr-2 flex-shrink-0">{item.icon}</span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4">
        {activeItem && (
          <div
            id={`panel-${activeItem.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeItem.id}`}
          >
            {activeItem.content}
          </div>
        )}
      </div>
    </div>
  );
};