import type { VoiceCommand } from '../../types';

interface RecentActivityListProps {
  activity: VoiceCommand[];
}

const intentVerb: Record<VoiceCommand['intent'], string> = {
  add_item: 'Added',
  remove_item: 'Removed',
  update_quantity: 'Updated',
  search_product: 'Searched',
  unknown: 'Tried',
};

const intentColor: Record<VoiceCommand['intent'], string> = {
  add_item: 'bg-forest',
  remove_item: 'bg-coral',
  update_quantity: 'bg-mustard',
  search_product: 'bg-forest/60',
  unknown: 'bg-line',
};

function formatRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const diffMs = Math.max(0, Date.now() - then);
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentActivityList({ activity }: RecentActivityListProps) {
  if (activity.length === 0) {
    return (
      <div className="rounded-xl border border-line/50 bg-cream-soft px-5 py-6 text-center">
        <p className="text-2xl mb-2">🎙️</p>
        <p className="text-sm font-medium text-ink-soft">No voice activity yet</p>
        <p className="text-xs text-ink-soft/60 mt-0.5">Tap the mic and say something to get started</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line/40 rounded-xl border border-line/50 bg-cream-soft overflow-hidden">
      {activity.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-cream-deep transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${intentColor[entry.intent]}`}
              aria-hidden="true"
            />
            <p className="text-sm text-ink min-w-0 truncate">
              <span className="font-medium text-ink-soft/80 mr-1">{intentVerb[entry.intent]}</span>
              &ldquo;{entry.transcript}&rdquo;
            </p>
          </div>
          <span className="num shrink-0 text-xs text-ink-soft/50">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  );
}
