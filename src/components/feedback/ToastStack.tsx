import { CircleCheck, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-toast flex items-center gap-3 rounded-2xl border border-line/10 bg-card/95 px-4 py-3 text-sm text-ink shadow-xl backdrop-blur"
        >
          <CircleCheck className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="rounded-full p-1 text-muted transition hover:bg-line/10 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
