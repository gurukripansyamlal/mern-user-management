import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Truck,
  RotateCcw,
  BookOpen,
  BarChart3,
  Boxes,
  Layers,
  Monitor,
  LogOut,
  CreditCard,
  Shield,
  ChevronRight,
} from 'lucide-react';

export const MobileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuSections = [
    {
      title: 'Operations & Point of Sale',
      items: [
        { label: 'POS Billing Terminal', path: '/admin/pos', icon: CreditCard, color: 'text-emerald-400' },
        { label: 'Returns & Stock Refunds', path: '/admin/returns', icon: RotateCcw, color: 'text-amber-400' },
        { label: 'Inventory Control', path: '/admin/inventory', icon: Boxes, color: 'text-purple-400' },
      ],
    },
    {
      title: 'Catalog & Directory',
      items: [
        { label: 'Category Hierarchy', path: '/admin/categories', icon: Layers, color: 'text-blue-400' },
        { label: 'Textile Suppliers & Mills', path: '/admin/suppliers', icon: Truck, color: 'text-orange-400' },
        { label: 'Staff & Cashier Access', path: '/admin/staff', icon: Users, color: 'text-indigo-400' },
      ],
    },
    {
      title: 'Financials & Intelligence',
      items: [
        { label: 'Financial General Ledger', path: '/admin/ledger', icon: BookOpen, color: 'text-rose-400' },
        { label: 'Analytics & Sales Reports', path: '/admin/reports', icon: BarChart3, color: 'text-teal-400' },
      ],
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* User Header Profile */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      {menuSections.map((sec) => (
        <div key={sec.title} className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            {sec.title}
          </h4>
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden divide-y divide-slate-700/50">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-700/40 active:bg-slate-700/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Mode Switch & Logout */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="w-full p-3.5 bg-slate-800/90 border border-slate-700/80 hover:bg-slate-700/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-400 transition"
        >
          <Monitor className="w-4 h-4" />
          <span>Switch to Desktop View</span>
        </button>

        <button
          onClick={logout}
          className="w-full p-3.5 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-950/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-rose-300 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Terminal</span>
        </button>
      </div>
    </div>
  );
};
