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
      <p className="py-4 text-xs text-ink-soft italic">No voice activity recorded yet. Try speaking a command!</p>
    );
  }

  return (
    <ul className="divide-y divide-line/60 rounded-xl border border-line/70 bg-cream-soft px-4 shadow-sm">
      {activity.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                entry.status === 'success' ? 'bg-forest' : 'bg-coral'
              }`}
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-ink">
              <span className="text-ink-soft/80 font-normal">{intentVerb[entry.intent]}</span>{' '}
              &ldquo;{entry.transcript}&rdquo;
            </p>
          </div>
          <span className="num shrink-0 text-xs font-medium text-ink-soft/70">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  );
}
