import type { ReactNode } from 'react';

interface ProductRailProps {
  children: ReactNode;
}

export function ProductRail({ children }: ProductRailProps) {
  return (
    <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
