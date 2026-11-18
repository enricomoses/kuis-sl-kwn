'use client';

import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export function notifySuccess(message: string, options?: ToastOptions) {
  toast.success(message, options);
}

export function notifyError(message: string, options?: ToastOptions) {
  toast.error(message, options);
}

export function notifyInfo(message: string, options?: ToastOptions) {
  toast.info(message, options);
}
