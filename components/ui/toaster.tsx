'use client';

import { Toast, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, action, ...props }) {
        return (
          <Toast key={id} className="text-center" {...props}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {action}
            {/* <ToastClose /> */}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
