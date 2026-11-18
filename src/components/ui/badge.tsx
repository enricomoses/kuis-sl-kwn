import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type BadgeTone = 'blue' | 'solid-blue' | 'coral' | 'neutral';

interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone;
}

export function Badge({
  tone = 'blue',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span {...props} className={cn('ui-badge', `ui-badge--${tone}`, className)}>
      {children}
    </span>
  );
}
