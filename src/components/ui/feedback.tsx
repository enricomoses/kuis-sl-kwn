import { AlertCircle, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils';

type FeedbackTone = 'info' | 'error';

interface FeedbackBannerProps {
  tone?: FeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function FeedbackBanner({
  tone = 'info',
  children,
  action,
  className,
}: FeedbackBannerProps) {
  const Icon = tone === 'error' ? AlertCircle : Info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('ui-feedback', `ui-feedback--${tone}`, className)}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
