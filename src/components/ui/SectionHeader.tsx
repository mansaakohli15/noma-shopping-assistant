interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  action?: { label: string; onClick?: () => void };
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="num text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 font-display text-xl font-semibold text-ink md:text-2xl">
          {title}
        </h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 text-xs font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
