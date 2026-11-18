import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type TextareaProps = ComponentPropsWithRef<'textarea'>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea {...props} className={cn('ui-textarea', className)} />;
}
