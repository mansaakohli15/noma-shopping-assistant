interface QuantityStepperProps {
  quantity: number;
  unit: string;
  onChange: (quantity: number) => void;
}

export function QuantityStepper({ quantity, unit, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-forest hover:text-forest disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft"
      >
        −
      </button>
      <span className="num min-w-[3.5rem] text-center text-sm text-ink">
        {quantity} {unit}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-forest hover:text-forest"
      >
        +
      </button>
    </div>
  );
}
