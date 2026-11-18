import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type SelectProps = ComponentPropsWithRef<'select'>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select {...props} className={cn('ui-select', className)}>
      {children}
    </select>
  );
}
