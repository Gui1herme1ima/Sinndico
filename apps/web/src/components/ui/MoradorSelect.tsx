import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/cn';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usersApi } from '@/services/api/usersApi';
import type { MoradorDiretorioResponse, ResidenciaResumo } from '@/services/api/types';

export function formatResidencia(residencia: ResidenciaResumo | null): string {
  if (!residencia) return '';
  const { bloco, rua, numero } = residencia;
  return bloco ? `Bloco ${bloco} — ${numero}` : `${rua}, ${numero}`;
}

export function labelMorador(morador: MoradorDiretorioResponse): string {
  if (!morador.residencia) return morador.nome;
  return `${morador.nome} — ${formatResidencia(morador.residencia)}`;
}

export interface MoradorSelectProps {
  label: string;
  value: string;
  onChange: (moradorId: string) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
}

export function MoradorSelect({
  label,
  value,
  onChange,
  required,
  disabled,
  helperText,
  error,
  placeholder = 'Buscar por nome ou apto...',
}: MoradorSelectProps) {
  const inputId = useId();
  const describedById = error || helperText ? `${inputId}-description` : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
  });

  const moradores = diretorioQuery.data ?? [];
  const selected = moradores.find((m) => m.id === value) ?? null;

  const debouncedQuery = useDebouncedValue(query, 200);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return moradores;
    return moradores.filter((m) => labelMorador(m).toLowerCase().includes(term));
  }, [moradores, debouncedQuery]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [debouncedQuery, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectMorador(morador: MoradorDiretorioResponse) {
    onChange(morador.id);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const morador = filtered[highlightIndex];
      if (morador) selectMorador(morador);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  const inputValue = open ? query : (selected ? labelMorador(selected) : query);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={describedById}
          autoComplete="off"
          required={required}
          disabled={disabled || diretorioQuery.isLoading}
          placeholder={diretorioQuery.isLoading ? 'Carregando...' : placeholder}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange('');
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-10 w-full rounded-lg border bg-surface px-3 text-text-primary',
            'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:opacity-50',
            error ? 'border-danger' : 'border-border',
          )}
        />
        {open && !diretorioQuery.isLoading && (
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-text-secondary">Nenhum morador encontrado.</li>
            )}
            {filtered.map((morador, index) => (
              <li
                key={morador.id}
                role="option"
                aria-selected={morador.id === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectMorador(morador);
                }}
                className={cn(
                  'cursor-pointer px-3 py-2 text-sm text-text-primary',
                  index === highlightIndex ? 'bg-primary/10' : undefined,
                )}
              >
                {labelMorador(morador)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {diretorioQuery.isError && (
        <p className="text-sm text-danger">Não foi possível carregar a lista de moradores.</p>
      )}
      {(error || helperText) && (
        <p id={describedById} className={cn('text-sm', error ? 'text-danger' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
