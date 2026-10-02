import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Menu,
  Monitor,
  Store,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Overview', path: '/admin/mobile', icon: LayoutDashboard },
    { label: 'POS Billing', path: '/admin/pos', icon: CreditCard },
    { label: 'Catalog', path: '/admin/mobile/products', icon: ShoppingBag },
    { label: 'More Ops', path: '/admin/mobile/menu', icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white leading-none">
              CloudHouse Mobile
            </h1>
            <span className="text-[10px] font-semibold text-emerald-400">
              Admin App Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to Desktop */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Switch to Desktop Layout"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Desktop</span>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Mobile Screen Area */}
      <main className="flex-1 p-3 pb-24 max-w-lg w-full mx-auto overflow-y-auto">
        <Outlet />
      </main>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.path === '/admin/mobile'
                ? location.pathname === '/admin/mobile'
                : location.pathname.startsWith(tab.path);

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-slate-900/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
