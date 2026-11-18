'use client';

import type { ReactNode } from 'react';
import { QuizToastContainer } from '@/components/common/feedback/toast-container';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <QuizToastContainer />
    </>
  );
}
