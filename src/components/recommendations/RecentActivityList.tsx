import type { VoiceCommand } from '../../types';

interface RecentActivityListProps {
  activity: VoiceCommand[];
}

const intentVerb: Record<VoiceCommand['intent'], string> = {
  add_item: 'Added',
  remove_item: 'Removed',
  update_quantity: 'Updated',
  search_product: 'Searched',
  unknown: 'Voice Command',
};

const intentBadgeStyle: Record<VoiceCommand['intent'], string> = {
  add_item: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  remove_item: 'bg-rose-50 text-rose-700 border-rose-200/60',
  update_quantity: 'bg-amber-50 text-amber-700 border-amber-200/60',
  search_product: 'bg-blue-50 text-blue-700 border-blue-200/60',
  unknown: 'bg-slate-50 text-slate-700 border-slate-200/60',
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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs">
        <p className="text-2xl mb-1.5">🎙️</p>
        <p className="text-sm font-bold text-slate-800">No voice activity yet</p>
        <p className="text-xs font-medium text-slate-400 mt-0.5">Tap the microphone to add or remove items by voice.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {activity.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`num rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider shrink-0 ${intentBadgeStyle[entry.intent]}`}>
              {intentVerb[entry.intent]}
            </span>
            <p className="text-sm font-semibold text-slate-800 truncate">
              &ldquo;{entry.transcript}&rdquo;
            </p>
          </div>
          <span className="num shrink-0 text-xs font-medium text-slate-400">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  );
}
