import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { useShoppingList } from '../../hooks/useShoppingList';

export function SideNav() {
  const { items } = useShoppingList();
  const itemCount = items.length;

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-line/50 bg-cream-soft px-4 py-8 md:flex"
    >
      <div>
        {/* Brand mark */}
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-cream font-display text-lg font-bold shadow-sm">
              N
            </span>
            <div>
              <span className="block font-display text-xl font-bold tracking-tight text-ink">NOMA</span>
              <span className="block text-[10px] font-medium text-ink-soft/70 tracking-wide">
                Voice Shopping
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-forest text-cream shadow-sm'
                      : 'text-ink-soft hover:bg-cream-deep hover:text-ink'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                {item.to === '/list' && itemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-cream tabular-nums">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Language support badge */}
      <div className="rounded-xl border border-line/50 bg-cream-deep p-3.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">🎙️</span>
          <span className="text-[11px] font-semibold text-ink">Multilingual</span>
        </div>
        <p className="text-[11px] text-ink-soft pl-6">English · हिंदी · Hinglish</p>
      </div>
    </nav>
  );
}
