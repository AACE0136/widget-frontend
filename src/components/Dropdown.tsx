import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export interface DropdownOption {
  id: string | number;
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValues?: (string | number)[];
  onChange?: (selected: (string | number)[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  showTags?: boolean;
  tagColor?: 'red' | 'blue' | 'green' | 'gray';
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function Dropdown({
  options,
  selectedValues = [],
  onChange,
  placeholder = 'Select...',
  multiSelect = true,
  showTags = true,
  tagColor = 'red',
  disabled = false,
  className = '',
  label,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<(string | number)[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string | number) => {
    let newSelected: (string | number)[];

    if (multiSelect) {
      if (selected.includes(optionId)) {
        newSelected = selected.filter((id) => id !== optionId);
      } else {
        newSelected = [...selected, optionId];
      }
    } else {
      newSelected = [optionId];
      setIsOpen(false);
    }

    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleRemoveTag = (optionId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selected.filter((id) => id !== optionId);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const getSelectedOptions = () => {
    return options.filter((opt) => selected.includes(opt.id));
  };

  const tagColorClasses = {
    red: 'bg-red-500 text-white hover:bg-red-600',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
    gray: 'bg-gray-500 text-white hover:bg-gray-600',
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-[#6E7C87] text-base leading-6 mb-2">
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          min-h-[44px] bg-white border border-gray-400 rounded-lg px-3 py-2 
          flex items-center justify-between gap-2 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}
          transition-colors
        `}
      >
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {showTags && selected.length > 0 ? (
            getSelectedOptions().map((option) => (
              <span
                key={option.id}
                className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium
                  ${tagColorClasses[tagColor]}
                  transition-colors
                `}
              >
                {option.label}
                <button
                  onClick={(e) => handleRemoveTag(option.id, e)}
                  className="hover:opacity-80 transition-opacity"
                  aria-label={`Remove ${option.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={20}
          className={`text-gray-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors text-sm
                    ${isSelected ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {multiSelect && isSelected && (
                      <Check size={20} className="text-red-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
