interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  action?: { label: string; onClick?: () => void };
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="num text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft/60">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink md:text-2xl">
          {title}
        </h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded-full border border-line/70 px-3 py-1 text-xs font-medium text-ink-soft transition-all hover:border-forest/40 hover:text-forest"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
