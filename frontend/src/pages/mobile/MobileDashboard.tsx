import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { DashboardStats, Sale } from '../../types';
import { InvoiceModal } from '../../components/pos/InvoiceModal';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  RotateCcw,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

export const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchMobileData = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentSales(res.recentSales);
        setSalesTrend(res.salesTrend);
        setLowStockAlerts(res.lowStockAlerts);
      }
    } catch (err) {
      console.error('Failed to load mobile dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Quick Launch Action Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-950/40 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
            POS Express
          </span>
          <h2 className="text-lg font-black leading-tight mt-0.5">Counter Terminal</h2>
          <p className="text-xs text-emerald-100/80 mt-1">Ready for checkout billing</p>
        </div>
        <button
          onClick={() => navigate('/admin/pos')}
          className="px-3.5 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition flex items-center gap-1.5"
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Launch POS</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white font-mono">
            ₹{(stats?.todayRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats?.todayTransactions || 0} completed bills
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Lifetime</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">₹</span>
          </div>
          <div className="mt-2 text-xl font-black text-white font-mono">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats?.totalTransactions || 0} orders
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/mobile/products')}
          className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl cursor-pointer hover:border-slate-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Textile SKUs</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white font-mono">
            {stats?.totalProducts || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage catalog</p>
        </div>

        <div
          onClick={() => navigate('/admin/inventory')}
          className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl cursor-pointer hover:border-amber-500/50 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black text-amber-400 font-mono">
            {stats?.lowStockCount || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Restock alerts</p>
        </div>
      </div>

      {/* Quick Ops Shortcuts */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center active:scale-95 transition"
        >
          <Plus className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-[11px] font-bold text-slate-200">Add Item</span>
        </button>

        <button
          onClick={() => navigate('/admin/returns')}
          className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center active:scale-95 transition"
        >
          <RotateCcw className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[11px] font-bold text-slate-200">Returns</span>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center active:scale-95 transition"
        >
          <TrendingUp className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[11px] font-bold text-slate-200">Reports</span>
        </button>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          7-Day Sales Trend (₹)
        </h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesTrend}>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Sales']}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recent Sales
          </h3>
          <button
            onClick={() => navigate('/admin/transactions')}
            className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"
          >
            <span>All Sales</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentSales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              onClick={() => {
                setSelectedSale(sale);
                setIsInvoiceOpen(true);
              }}
              className="p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl flex items-center justify-between active:bg-slate-700/50 cursor-pointer transition"
            >
              <div>
                <p className="text-xs font-mono font-bold text-white">{sale.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {sale.customerName || 'Walk-in'} • {sale.paymentMethod}
                </p>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="text-xs font-mono font-black text-emerald-400">
                    ₹{sale.total.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};
