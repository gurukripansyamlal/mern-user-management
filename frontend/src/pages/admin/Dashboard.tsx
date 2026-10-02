import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { DashboardStats, Sale } from '../../types';
import { InvoiceModal } from '../../components/pos/InvoiceModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Truck,
  ArrowUpRight,
  Receipt,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentSales(res.recentSales);
        setLowStockAlerts(res.lowStockAlerts);
        setSalesTrend(res.salesTrend);
        setPaymentBreakdown(res.paymentMethodBreakdown);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleViewInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  if (isLoading && !stats) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
        <p className="text-xs">Loading analytics and telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Showroom Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales, inventory telemetry, and operational performance overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/pos')}
            className="text-xs gap-1.5"
          >
            <span>Open POS Counter</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              ₹{(stats?.todayRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.todayTransactions || 0} bills completed today
            </p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Sales Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.totalTransactions || 0} total lifetime sales
            </p>
          </div>
        </div>

        {/* Products in Store */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Catalog</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {stats?.totalProducts || 0} SKUs
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across 6 textile categories
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => navigate('/admin/inventory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {stats?.lowStockCount || 0} Items
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.outOfStockCount || 0} completely out of stock
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Sales Revenue Trend</h3>
              <p className="text-xs text-slate-500">Daily store turnover in rupees</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-500">Cash vs Card vs UPI distribution</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Warning List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Low Stock Warning</h3>
              </div>
              <button
                onClick={() => navigate('/admin/inventory')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {lowStockAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  All products have sufficient stock levels!
                </p>
              ) : (
                lowStockAlerts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 leading-tight truncate max-w-[170px]">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          prod.stockQuantity === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/products')}
            className="w-full mt-4 text-xs"
          >
            Manage Product Catalog
          </Button>
        </div>

        {/* Recent Store Transactions Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Showroom Sales</h3>
              <p className="text-xs text-slate-500">Latest completed customer checkout receipts</p>
            </div>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View Full History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Staff</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {sale.staff?.name || 'Cashier'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          sale.paymentMethod === 'CASH'
                            ? 'emerald'
                            : sale.paymentMethod === 'UPI'
                            ? 'purple'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {sale.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{sale.total.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleViewInvoice(sale)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition"
                        title="View & Print Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};
