import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { ChevronDownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export interface FilterPillOption {
  value: string;
  label: string;
}

export interface FilterPillProps {
  label: string;
  value: string;
  options: FilterPillOption[];
  onChange: (value: string) => void;
  defaultLabel?: string;
}

export function FilterPill({ label, value, options, onChange, defaultLabel = 'Todos' }: FilterPillProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[highlightIndex];
      if (option) selectOption(option.value);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-[38px] items-center gap-2 rounded-lg border border-border bg-surface px-3',
          'text-[13px] font-medium text-text-secondary',
          'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
        )}
      >
        <span>
          {label}: <b className="font-semibold text-text-primary">{selected?.label ?? defaultLabel}</b>
        </span>
        <ChevronDownIcon width={13} height={13} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 min-w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option.value);
              }}
              className={cn(
                'cursor-pointer whitespace-nowrap px-3 py-2 text-sm text-text-primary',
                index === highlightIndex ? 'bg-primary/10' : undefined,
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
