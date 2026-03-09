import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Task Manager', icon: ClipboardList, path: '/tasks' },
  { label: 'Analytics', icon: Settings, path: '/analytics' },
];

export const Sidebar: React.FC<{ collapsed?: boolean; onClose?: () => void }> = ({ collapsed, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full glass-sidebar z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="text-xl font-extrabold text-gradient tracking-tight outfit-font">OpsWatch</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <div key={item.label} className="relative group">
              <Link
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                {/* Left border accent */}
                <div className={cn(
                  'absolute left-0 top-0 w-1 bg-primary rounded-r transition-all duration-200',
                  active ? 'h-full' : 'h-0 group-hover:h-full'
                )} />
                <item.icon className={cn('w-5 h-5 shrink-0', active && 'text-primary')} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 shrink-0">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">{user?.username ?? 'admin'}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3 p-1 bg-muted/20 rounded-lg">
          <ThemeToggle className="flex-1" />
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-danger transition-colors duration-200 cursor-pointer',
              collapsed && 'justify-center p-2'
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </div>
    </aside>
  );
};
