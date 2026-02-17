import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquareWarning,
  RotateCcw,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Package,
  Folder,
  Star,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminLogout } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Folder },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/contributions', label: 'Contributions', icon: HeartHandshake },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link to="/admin/dashboard" className="font-display font-medium text-xl text-foreground tracking-wide">
              TAJDO <span className="text-xs font-sans font-normal text-muted-foreground ml-1">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-60' : 'ml-16'
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {navItems.find((i) => location.pathname.startsWith(i.to))?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Administrator</span>
            <div className="w-8 h-8 rounded-none bg-secondary flex items-center justify-center text-foreground text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
