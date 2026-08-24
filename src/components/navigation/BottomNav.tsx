import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { useShoppingList } from '../../hooks/useShoppingList';

export function BottomNav() {
  const { items } = useShoppingList();
  const itemCount = items.length;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line/70 bg-cream-soft/95 backdrop-blur-md md:hidden shadow-lg"
    >
      <ul className="flex items-stretch justify-around">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-forest' : 'text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`relative ${isActive ? 'text-coral scale-110' : ''}`}>
                    {item.icon}
                    {item.to === '/list' && itemCount > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-cream">
                        {itemCount}
                      </span>
                    )}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
