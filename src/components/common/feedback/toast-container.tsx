'use client';

import { ToastContainer } from 'react-toastify';
import { cn } from '@/utils';

interface QuizToastContainerProps {
  className?: string;
}

export function QuizToastContainer({ className }: QuizToastContainerProps) {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      theme="light"
      className={cn('quiz-toast-container', className)}
    />
  );
}
