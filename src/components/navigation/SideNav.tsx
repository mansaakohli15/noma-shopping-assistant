import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { useShoppingList } from '../../hooks/useShoppingList';

export function SideNav() {
  const { items } = useShoppingList();
  const itemCount = items.length;

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-line/60 bg-cream-soft px-4 py-8 md:flex shadow-sm"
    >
      <div>
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-cream font-bold font-display text-lg shadow-sm">
              N
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-forest">NOMA</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-soft/80">Voice-First Shopping Companion</p>
        </div>

        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-forest text-cream shadow-md scale-[1.02]'
                      : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                {item.to === '/list' && itemCount > 0 && (
                  <span className="rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-cream">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer info badge */}
      <div className="rounded-xl border border-line/60 bg-cream p-3 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-forest">
          🎙 Multilingual NLP
        </span>
        <p className="mt-0.5 text-[10px] text-ink-soft">English · Hindi · Hinglish</p>
      </div>
    </nav>
  );
}
