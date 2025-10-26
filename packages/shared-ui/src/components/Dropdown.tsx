import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  value: any;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  items: DropdownItem[];
  value?: any;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (item: DropdownItem) => void;
  renderItem?: (item: DropdownItem) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  placeholder = 'Select an option',
  disabled = false,
  className,
  onChange,
  renderItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(item => item.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      onChange?.(item);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        className={clsx(
          'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          disabled && 'cursor-not-allowed bg-gray-50 text-gray-500'
        )}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {selectedItem?.icon && (
            <span className="mr-2 flex-shrink-0">{selectedItem.icon}</span>
          )}
          <span className="block truncate">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown
            className={clsx(
              'h-5 w-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item) => (
            <div
              key={item.id}
              className={clsx(
                'relative cursor-default select-none py-2 pl-3 pr-9',
                item.disabled
                  ? 'text-gray-400'
                  : 'text-gray-900 hover:bg-blue-600 hover:text-white cursor-pointer',
                value === item.value && 'bg-blue-600 text-white'
              )}
              onClick={() => handleItemClick(item)}
            >
              {renderItem ? (
                renderItem(item)
              ) : (
                <div className="flex items-center">
                  {item.icon && (
                    <span className="mr-2 flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="block truncate">{item.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};