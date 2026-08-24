interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-line px-5 pb-6 pt-8 md:px-10 md:pt-10">
      <p className="num text-xs uppercase tracking-[0.18em] text-coral">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      )}
    </header>
  );
}
