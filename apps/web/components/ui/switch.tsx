'use client';

import * as React from 'react';

export type SwitchVariant = 'emerald' | 'amber' | 'forest';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: SwitchVariant;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
}

const ACTIVE_TRACK_STYLES: Record<SwitchVariant, string> = {
  emerald: 'bg-[#10B981] border-[#059669]',
  amber: 'bg-[#D97706] border-[#B45309]',
  forest: 'bg-[#0F291E] border-[#0A1C14]',
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  variant = 'emerald',
  label,
  description,
  id,
  className = '',
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;

  const trackDimensions =
    size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const thumbDimensions =
    size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const thumbTranslate =
    size === 'sm'
      ? checked
        ? 'translate-x-3'
        : 'translate-x-0.5'
      : checked
        ? 'translate-x-4'
        : 'translate-x-0.5';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onCheckedChange(!checked);
    }
  };

  return (
    <div className={['inline-flex items-center gap-2.5', className].join(' ')}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        onKeyDown={handleKeyDown}
        className={[
          'relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F291E]/30 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          trackDimensions,
          checked
            ? ACTIVE_TRACK_STYLES[variant]
            : 'bg-[#E8E6DF] border-[#D5D2C8]',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block rounded-full bg-white shadow-2xs transition-transform duration-150',
            thumbDimensions,
            thumbTranslate,
          ].join(' ')}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className="text-xs font-medium text-[#141413] leading-tight cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-[11px] text-[#8A8884] leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
