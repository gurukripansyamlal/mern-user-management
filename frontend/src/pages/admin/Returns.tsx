import React, { useState, useEffect } from 'react';
import { returnService } from '../../services/returnService';
import { posService } from '../../services/posService';
import { Sale, SaleItem, ReturnRecord } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Receipt,
  ArrowRight,
} from 'lucide-react';

export const Returns: React.FC = () => {
  const { success, error, warning } = useToast();

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [searchedSale, setSearchedSale] = useState<Sale | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Return Processing Form
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null);
  const [returnQty, setReturnQty] = useState('1');
  const [reason, setReason] = useState('Size mismatch / exchange');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Returns History
  const [returnsHistory, setReturnsHistory] = useState<ReturnRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchReturnsHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await returnService.getReturns();
      if (res.success) {
        setReturnsHistory(res.returns);
      }
    } catch (err) {
      console.error('Failed to load returns history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReturnsHistory();
  }, []);

  const handleSearchInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceSearch.trim()) return;

    setIsSearching(true);
    setSearchedSale(null);
    setSelectedItem(null);
    try {
      const res = await posService.getTransactionById(invoiceSearch.trim());
      if (res.success && res.sale) {
        setSearchedSale(res.sale);
      } else {
        error('Invoice not found');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Invoice record not found');
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRefund = () => {
    if (!selectedItem) return 0;
    const qty = parseInt(returnQty, 10) || 0;
    const rate = selectedItem.total / selectedItem.quantity;
    return Math.round(rate * qty * 100) / 100;
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedSale || !selectedItem) return;

    const qty = parseInt(returnQty, 10);
    const availableToReturn = selectedItem.quantity - (selectedItem.returnedQuantity || 0);

    if (isNaN(qty) || qty <= 0) {
      warning('Return quantity must be greater than 0');
      return;
    }

    if (qty > availableToReturn) {
      warning(`Cannot return more than ${availableToReturn} unit(s)`);
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      warning('Please provide a reason for return');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await returnService.processReturn({
        saleId: searchedSale.id,
        productId: selectedItem.productId,
        quantity: qty,
        reason: finalReason,
      });

      if (res.success) {
        success(`Return processed! Stock restored and refund of ₹${calculateRefund()} issued.`);
        setSelectedItem(null);
        setReturnQty('1');
        // Refresh invoice data to see updated remaining quantities
        const updatedSaleRes = await posService.getTransactionById(searchedSale.id);
        if (updatedSaleRes.success) {
          setSearchedSale(updatedSaleRes.sale);
        }
        fetchReturnsHistory();
      } else {
        error(res.message || 'Failed to process return');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Error processing return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Returns & Refunds</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Process customer returns, restore warehouse stock, and log refund debits
        </p>
      </div>

      {/* Invoice Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-600" />
          <span>Step 1: Look Up Original Customer Invoice</span>
        </h3>

        <form onSubmit={handleSearchInvoice} className="flex gap-2 max-w-md">
          <input
            type="text"
            required
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            placeholder="e.g. INV-2026-1001"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
          />
          <Button variant="primary" type="submit" isLoading={isSearching} className="text-xs font-bold">
            Search Bill
          </Button>
        </form>
      </div>

      {/* Invoice Found & Item Selector */}
      {searchedSale && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900 font-mono">
                  {searchedSale.invoiceNumber}
                </h4>
                <Badge variant={searchedSale.paymentStatus === 'PAID' ? 'emerald' : 'amber'} size="sm">
                  {searchedSale.paymentStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Billed on {new Date(searchedSale.createdAt).toLocaleDateString('en-IN')} by{' '}
                {searchedSale.staff?.name}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Billed:</span>{' '}
              <strong className="font-mono text-slate-900 font-black">₹{searchedSale.total}</strong>
            </div>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Step 2: Select Purchased Item to Return
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchedSale.items.map((item) => {
              const eligible = item.quantity - (item.returnedQuantity || 0);
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (eligible > 0) {
                      setSelectedItem(item);
                      setReturnQty('1');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all ${
                    eligible === 0
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 cursor-pointer shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 cursor-pointer bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.product?.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        ₹{item.unitPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Billed: <strong>{item.quantity}</strong> | Returned: <strong>{item.returnedQuantity || 0}</strong>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        eligible > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {eligible > 0 ? `${eligible} Eligible` : 'Fully Returned'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Return Execution Panel */}
          {selectedItem && (
            <form onSubmit={handleProcessReturn} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Step 3: Confirm Return Details & Calculate Refund</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Return Quantity (Max: {selectedItem.quantity - (selectedItem.returnedQuantity || 0)})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity - (selectedItem.returnedQuantity || 0)}
                    required
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Size mismatch / exchange">Size mismatch / exchange</option>
                    <option value="Defective fabric or stitching">Defective fabric or stitching</option>
                    <option value="Customer changed mind">Customer changed mind</option>
                    <option value="Color or print defect">Color or print defect</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                {/* Refund Calculation Box */}
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Refund Payable</span>
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    ₹{calculateRefund().toFixed(2)}
                  </div>
                </div>
              </div>

              {reason === 'Other' && (
                <Input
                  label="Specify Reason"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Gift returned by recipient"
                />
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedItem(null)}>
                  Cancel Selection
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} className="gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Return & Restore Stock</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Returns History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Returns Audit Trail</h3>
          <Button variant="outline" size="sm" onClick={fetchReturnsHistory} className="gap-1 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {isLoadingHistory ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Loading returns records...</p>
          </div>
        ) : returnsHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <RotateCcw className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No returns processed yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4 text-center">Returned Qty</th>
                  <th className="py-3 px-4 text-right">Refund Amount</th>
                  <th className="py-3 px-4">Return Reason</th>
                  <th className="py-3 px-4">Processed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnsHistory.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(ret.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ret.sale?.invoiceNumber || 'INV'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{ret.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ret.product?.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {ret.quantity} {ret.product?.unit || 'pcs'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      -₹{ret.refundAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ret.reason}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ret.processedBy?.name || 'Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
