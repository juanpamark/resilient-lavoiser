import * as React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'amber';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0F291E] text-[#FAF8F5] hover:bg-[#163829] active:bg-[#0A1C14] border border-[#0A1C14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_1px_2px_0_rgba(20,20,19,0.08)]',
  secondary:
    'bg-[#141413] text-[#FAF8F5] hover:bg-[#262624] active:bg-[#141413] border border-[#141413] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_1px_2px_0_rgba(20,20,19,0.06)]',
  outline:
    'bg-white text-[#141413] hover:bg-[#FAF8F5] active:bg-[#F3F1EC] border border-[#D5D2C8] shadow-[0_1px_2px_0_rgba(20,20,19,0.04)]',
  ghost:
    'bg-transparent text-[#575653] hover:text-[#141413] hover:bg-[#F3F1EC] active:bg-[#E8E6DF] border border-transparent',
  danger:
    'bg-[#991B1B] text-white hover:bg-[#7F1D1D] active:bg-[#651616] border border-[#7F1D1D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_1px_2px_0_rgba(20,20,19,0.08)]',
  amber:
    'bg-[#D97706] text-white hover:bg-[#B45309] active:bg-[#92400E] border border-[#B45309] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_1px_2px_0_rgba(20,20,19,0.08)]',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] rounded-md gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-9 px-3.5 text-[13px] rounded-md gap-2',
  lg: 'h-10 px-4 text-sm rounded-lg gap-2',
  icon: 'h-8 w-8 rounded-md justify-center p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || isLoading);

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-medium tracking-[-0.01em] transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F291E]/30 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
