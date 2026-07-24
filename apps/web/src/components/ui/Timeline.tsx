import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { cn } from '@/lib/cn';

export type TimelineStepState = 'done' | 'active' | 'pending';

export interface TimelineStep {
  label: string;
  /** ISO — omitido quando o passo ainda não aconteceu (sem timestamp no backend). */
  timestamp?: string | null;
  state: TimelineStepState;
}

const dotClass: Record<TimelineStepState, string> = {
  done: 'bg-success',
  active: 'bg-primary',
  pending: 'bg-border',
};

const labelClass: Record<TimelineStepState, string> = {
  done: 'text-text-primary',
  active: 'text-text-primary',
  pending: 'text-text-muted',
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
          {index < steps.length - 1 && (
            <span className="absolute left-[5px] top-3 h-full w-px bg-border" aria-hidden="true" />
          )}
          <span
            className={cn(
              'relative z-10 mt-1 h-[11px] w-[11px] flex-shrink-0 rounded-full',
              dotClass[step.state],
              step.state === 'active' && 'ring-4 ring-primary/15',
            )}
          />
          <div>
            <p className={cn('text-sm font-medium', labelClass[step.state])}>{step.label}</p>
            {step.timestamp && (
              <p className="text-xs text-text-muted" title={formatDate(step.timestamp)}>
                {formatRelativeTime(step.timestamp)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
