import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { useShoppingList } from '../../hooks/useShoppingList';

export function SideNav() {
  const { items } = useShoppingList();
  const itemCount = items.length;

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-cream-soft px-5 py-7 md:flex shadow-2xs"
    >
      <div>
        {/* Brand Mark */}
        <div className="mb-8 px-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-cream font-display text-xl font-extrabold shadow-xs relative">
              N
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-coral border-2 border-white" />
            </span>
            <div>
              <span className="block font-display text-xl font-extrabold tracking-tight text-ink leading-tight">
                NOMA
              </span>
              <span className="block text-[11px] font-semibold text-forest">
                Voice Shopping Companion
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-forest-pale text-forest shadow-2xs'
                      : 'text-ink-soft hover:bg-cream-deep hover:text-ink'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  {item.icon}
                  {item.label}
                </div>
                {item.to === '/list' && itemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[11px] font-extrabold text-white tabular-nums">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Multilingual Support Pill */}
      <div className="rounded-2xl border border-line bg-cream-deep/60 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-coral animate-pulse" />
          <span className="text-xs font-bold text-ink">Multilingual Voice NLP</span>
        </div>
        <p className="mt-1 text-[11px] font-medium text-ink-soft">
          English · हिंदी · Hinglish
        </p>
      </div>
    </nav>
  );
}
