import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type CardTone = 'white' | 'blue' | 'coral' | 'cream';

interface CardProps extends ComponentPropsWithRef<'div'> {
  tone?: CardTone;
}

export function Card({
  tone = 'white',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'ui-card',
        tone !== 'white' && `ui-card--${tone}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
