import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutContextType {
  onMenuClick: () => void;
}

export const LayoutContext = React.createContext<LayoutContextType>({ onMenuClick: () => {} });

export const useLayout = () => React.useContext(LayoutContext);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ onMenuClick: () => setMobileOpen(true) }}>
      <div className="min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        )}

        <main className={cn('lg:ml-60 min-h-screen animate-fade-slide-up')}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
};
