import type { AppLanguage } from '../../lib/language';

interface LanguageSelectorProps {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}

const options: Array<{ value: AppLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'hinglish', label: 'Hinglish' },
];

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div className="inline-flex rounded-full border border-line bg-cream-soft p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={language === option.value}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            language === option.value ? 'bg-forest text-cream' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
