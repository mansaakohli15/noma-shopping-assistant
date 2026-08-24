interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-5 transition-all duration-300 md:bottom-6 ${
        message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {message && (
        <div className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
