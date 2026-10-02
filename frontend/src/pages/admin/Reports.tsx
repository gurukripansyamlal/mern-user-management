import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { Button } from '../../components/common/Button';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  RefreshCw,
  Award,
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

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'payments' | 'inventory'>('sales');

  // Sales Report
  const [salesReport, setSalesReport] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Products Report
  const [productReport, setProductReport] = useState<any[]>([]);

  // Payment Report
  const [paymentReport, setPaymentReport] = useState<any>(null);

  // Inventory Report
  const [inventoryReport, setInventoryReport] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentReport = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await reportService.getSalesReport({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        if (res.success) setSalesReport(res);
      } else if (activeTab === 'products') {
        const res = await reportService.getProductReport();
        if (res.success) setProductReport(res.bestSellers);
      } else if (activeTab === 'payments') {
        const res = await reportService.getPaymentReport();
        if (res.success) setPaymentReport(res);
      } else if (activeTab === 'inventory') {
        const res = await reportService.getInventoryReport();
        if (res.success) setInventoryReport(res);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentReport();
  }, [activeTab, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Intelligence & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed performance telemetry, bestseller rankings, and financial audits
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchCurrentReport} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Sales & Revenue Report</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>Best-Selling Products</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span>Payment Methods Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-amber-600" />
          <span>Inventory Valuation</span>
        </button>
      </div>

      {/* Tab 1: Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Date Picker Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Filter Report Range:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sales Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Gross Sales Revenue</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-2">
                ₹{salesReport?.summary?.totalRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {salesReport?.summary?.transactionCount || 0} checkout bills
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Average Bill Size</span>
              <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-2">
                ₹{Math.round(salesReport?.summary?.averageOrderValue || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Per-customer transaction</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Discounts Conceded</span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-2">
                ₹{salesReport?.summary?.totalDiscounts?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Customer promo reductions</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Taxes Collected (GST)</span>
              <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono mt-2">
                ₹{salesReport?.summary?.totalTax?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Remittable to tax authority</p>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Daily Sales Turnover Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.dailyBreakdown || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Daily Sales Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Transactions</th>
                    <th className="py-3 px-4 text-right">Tax Collected</th>
                    <th className="py-3 px-4 text-right">Discounts</th>
                    <th className="py-3 px-4 text-right">Net Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(salesReport?.dailyBreakdown || []).map((row: any) => (
                    <tr key={row.date} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.date}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{row.count}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{row.tax.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600">₹{row.discount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{row.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Best-Selling Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Product Performance Ranking</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by total retail revenue generated and units sold
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Est. Gross Profit</th>
                  <th className="py-3 px-4 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productReport.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 leading-snug">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{p.categoryName}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                      {p.quantitySold} pcs
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{p.sellingPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{p.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      +₹{p.estimatedProfit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {p.marginPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Breakdown Audit */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Methods Distribution</h3>
              <p className="text-xs text-slate-500">Visual share of revenue per channel</p>
            </div>

            <div className="h-64 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentReport?.paymentBreakdown || []}
                    dataKey="totalAmount"
                    nameKey="paymentMethod"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {(paymentReport?.paymentBreakdown || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Payment Channel Breakdown</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {(paymentReport?.paymentBreakdown || []).map((pm: any) => (
                <div key={pm.paymentMethod} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 uppercase text-xs">{pm.paymentMethod}</span>
                    <p className="text-xs text-slate-500">{pm.transactionCount} transactions</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ₹{pm.totalAmount.toLocaleString()}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">{pm.percentage}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Inventory Valuation */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Active SKUs</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {inventoryReport?.summary?.totalProducts || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Physical Stock Count</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {inventoryReport?.summary?.totalStockUnits?.toLocaleString() || 0} units
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Capital at Cost</span>
              <div className="text-2xl font-black text-blue-700 font-mono mt-2">
                ₹{inventoryReport?.summary?.totalValuationCost?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Retail Sales Potential</span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
                ₹{inventoryReport?.summary?.totalValuationRetail?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
