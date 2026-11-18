import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type InputProps = ComponentPropsWithRef<'input'>;

export function Input({ className, ...props }: InputProps) {
  return <input {...props} className={cn('ui-input', className)} />;
}
