import type { VoiceCommand } from '../types';

// Recent voice activity shown on the Home page. Recommendation content
// (usuals, replenishment, seasonal) now comes from recommendationService —
// this file only holds what's still static demo content.

export const recentActivity: VoiceCommand[] = [
  {
    id: 'activity-1',
    transcript: 'Add two bottles of milk',
    intent: 'add_item',
    timestamp: '2026-08-23T08:14:00+05:30',
    status: 'success',
  },
  {
    id: 'activity-2',
    transcript: 'Remove bread',
    intent: 'remove_item',
    timestamp: '2026-08-22T19:02:00+05:30',
    status: 'success',
  },
  {
    id: 'activity-3',
    transcript: 'Find organic apples',
    intent: 'search_product',
    timestamp: '2026-08-22T11:47:00+05:30',
    status: 'success',
  },
];
