import React, { useState, useEffect } from 'react';
import { posService } from '../../services/posService';
import { Sale } from '../../types';
import { InvoiceModal } from '../../components/pos/InvoiceModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Search, Receipt, Printer, Eye, RefreshCw, Filter, Calendar } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await posService.getTransactions({
        search: search || undefined,
        paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setSales(res.sales);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, paymentMethod, paymentStatus, startDate, endDate]);

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History & Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and inspect all customer sales receipts and billing entries
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchTransactions} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, customer..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Methods</option>
            <option value="CASH">Cash Only</option>
            <option value="CARD">Card Only</option>
            <option value="UPI">UPI Only</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
            <option value="REFUNDED">Fully Refunded</option>
          </select>

          {/* Date Pickers */}
          <div className="flex items-center gap-1.5">
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
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Loading transaction records...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No transactions match these criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Billed By Staff</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(sale.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {sale.staff?.name || 'Cashier'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {sale.customerName ? (
                        <div>
                          <p className="font-semibold text-slate-900">{sale.customerName}</p>
                          {sale.customerPhone && (
                            <p className="text-[10px] text-slate-400 font-mono">{sale.customerPhone}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">
                      {sale.items?.reduce((s, i) => s + i.quantity, 0) || 0} pcs
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          sale.paymentMethod === 'CASH'
                            ? 'emerald'
                            : sale.paymentMethod === 'UPI'
                            ? 'purple'
                            : 'blue'
                        }
                      >
                        {sale.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          sale.paymentStatus === 'PAID'
                            ? 'emerald'
                            : sale.paymentStatus === 'PARTIALLY_REFUNDED'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                      >
                        {sale.paymentStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      ₹{sale.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(sale)}
                        className="py-1 px-2.5 text-xs gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
