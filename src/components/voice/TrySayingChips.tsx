// Example phrases shown to teach the user what to say. Now that the mic
// runs real speech recognition, these are just suggestions to read and
// speak yourself — no longer wired to a scripted result.
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
          className="rounded-full border border-line bg-cream-soft px-3.5 py-1.5 text-xs text-ink-soft"
        >
          &ldquo;{phrase}&rdquo;
        </li>
      ))}
    </ul>
  );
}
