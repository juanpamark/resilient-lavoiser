import * as React from 'react';

export type OperationalStatus =
  | 'ai_active'
  | 'human_handoff'
  | 'kitchen_alert'
  | 'neutral'
  | 'offline';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OperationalStatus;
  label: string;
  metric?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const STATUS_CONTAINER_STYLES: Record<OperationalStatus, string> = {
  ai_active:
    'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  human_handoff:
    'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  kitchen_alert:
    'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
  neutral:
    'bg-[#F3F1EC] text-[#575653] border-[#E8E6DF]',
  offline:
    'bg-[#F5F5F4] text-[#78716C] border-[#D6D3D1]',
};

const STATUS_DOT_STYLES: Record<OperationalStatus, string> = {
  ai_active: 'bg-[#10B981]',
  human_handoff: 'bg-[#D97706]',
  kitchen_alert: 'bg-[#EA580C]',
  neutral: 'bg-[#8A8884]',
  offline: 'bg-[#A8A29E]',
};

export function StatusPill({
  status,
  label,
  metric,
  pulse = false,
  size = 'sm',
  className = '',
  ...props
}: StatusPillProps) {
  const sizeClasses =
    size === 'sm'
      ? 'h-5 px-2 text-[11px] gap-1.5'
      : 'h-6 px-2.5 text-xs gap-2';

  return (
    <span
      className={[
        'inline-flex items-center rounded-md border font-medium tracking-[-0.01em] select-none shrink-0',
        STATUS_CONTAINER_STYLES[status],
        sizeClasses,
        className,
      ].join(' ')}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse && (
          <span
            className={[
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              STATUS_DOT_STYLES[status],
            ].join(' ')}
          />
        )}
        <span
          className={[
            'relative inline-flex rounded-full h-1.5 w-1.5',
            STATUS_DOT_STYLES[status],
          ].join(' ')}
        />
      </span>
      <span className="truncate">{label}</span>
      {metric && (
        <>
          <span className="opacity-40" aria-hidden="true">
            ·
          </span>
          <span className="font-mono metric-mono font-semibold">{metric}</span>
        </>
      )}
    </span>
  );
}
