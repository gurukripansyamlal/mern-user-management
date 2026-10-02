import React, { useState, useEffect } from 'react';
import { posService } from '../../services/posService';
import { Sale } from '../../types';
import { InvoiceModal } from '../../components/pos/InvoiceModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Search, Receipt, Printer, Eye, Calendar, RefreshCw } from 'lucide-react';

export const StaffTransactions: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMySales = async () => {
    setIsLoading(true);
    try {
      const res = await posService.getTransactions({ search });
      if (res.success) {
        setSales(res.sales);
      }
    } catch (err) {
      console.error('Failed to fetch staff sales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySales();
  }, [search]);

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">My Shift Sales History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transactions processed under your cashier account during current and past shifts
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number..."
            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Loading your shift sales records...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No transactions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              New sales processed from POS will appear here immediately
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
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
                    <td className="py-3 px-4 text-slate-700">
                      {sale.customerName || <span className="text-slate-400 italic">Walk-in</span>}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
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
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{sale.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(sale)}
                        className="py-1 px-2.5 text-xs gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
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
