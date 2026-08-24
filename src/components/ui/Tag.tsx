interface TagProps {
  children: string;
  tone?: 'forest' | 'coral' | 'mustard';
}

const toneClasses: Record<NonNullable<TagProps['tone']>, string> = {
  forest: 'bg-forest text-cream',
  coral: 'bg-coral text-cream',
  mustard: 'bg-mustard text-ink',
};

// Used sparingly — a sticker-like label on a product or section, not a
// decoration repeated on every element.
export function Tag({ children, tone = 'forest' }: TagProps) {
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
