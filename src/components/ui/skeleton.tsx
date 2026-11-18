import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils';

type SkeletonProps = ComponentPropsWithRef<'div'>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn('ui-skeleton', className)}
    />
  );
}
