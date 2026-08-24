import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { useShoppingList } from '../../hooks/useShoppingList';

export function SideNav() {
  const { items } = useShoppingList();
  const itemCount = items.length;

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white px-5 py-7 md:flex shadow-2xs"
    >
      <div>
        {/* Brand Mark */}
        <div className="mb-8 px-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-display text-xl font-extrabold shadow-xs">
              N
            </span>
            <div>
              <span className="block font-display text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                NOMA
              </span>
              <span className="block text-[11px] font-semibold text-emerald-700">
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
                      ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  {item.icon}
                  {item.label}
                </div>
                {item.to === '/list' && itemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-extrabold text-white tabular-nums">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Multilingual Support Pill */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900">Multilingual Voice NLP</span>
        </div>
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          English · हिंदी · Hinglish
        </p>
      </div>
    </nav>
  );
}
