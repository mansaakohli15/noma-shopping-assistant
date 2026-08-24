const suggestions = [
  'Add two bottles of milk',
  'Remove bread',
  'Find organic apples',
  'What should I buy?',
];

export function TrySayingChips() {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {suggestions.map((phrase) => (
        <li
          key={phrase}
          className="rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-500/40 hover:text-emerald-700 shadow-2xs"
        >
          &ldquo;{phrase}&rdquo;
        </li>
      ))}
    </ul>
  );
}
