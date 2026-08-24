import type { ReactNode } from 'react';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg {...iconProps}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    to: '/list',
    label: 'List',
    icon: (
      <svg {...iconProps}>
        <path d="M9 5h11" />
        <path d="M9 12h11" />
        <path d="M9 19h11" />
        <path d="m4 5 1 1 2-2" />
        <path d="m4 12 1 1 2-2" />
        <path d="m4 19 1 1 2-2" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Search',
    icon: (
      <svg {...iconProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.3-4.3" />
      </svg>
    ),
  },
  {
    to: '/insights',
    label: 'Insights',
    icon: (
      <svg {...iconProps}>
        <path d="M4 19V10" />
        <path d="M11 19V5" />
        <path d="M18 19v-7" />
      </svg>
    ),
  },
];
