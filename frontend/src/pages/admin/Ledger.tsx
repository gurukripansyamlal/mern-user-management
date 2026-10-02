import React, { useState, useEffect } from 'react';
import { ledgerService } from '../../services/ledgerService';
import { LedgerEntry } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const Ledger: React.FC = () => {
  const { success, error } = useToast();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [totalDebit, setTotalDebit] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manual Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await ledgerService.getLedger({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setEntries(res.entries);
        setCurrentBalance(res.currentBalance);
        setTotalCredit(res.totalCredit);
        setTotalDebit(res.totalDebit);
      }
    } catch (err: any) {
      error('Failed to load ledger records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [typeFilter, startDate, endDate]);

  const handleManualEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ledgerService.createManualEntry({
        type: entryType,
        description,
        amount: numAmount,
        isCredit,
        reference: reference || undefined,
      });

      if (res.success) {
        success('Ledger entry recorded');
        setIsModalOpen(false);
        setDescription('');
        setAmount('');
        setReference('');
        fetchLedger();
      } else {
        error(res.message || 'Failed to record entry');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial General Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of showroom sales, refunds, expenses, and running cash/bank balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLedger} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsCredit(false);
              setEntryType('EXPENSE');
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Manual Entry</span>
          </Button>
        </div>
      </div>

      {/* Account Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Current Ledger Balance</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              ₹{currentBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Net showroom liquid capital</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Credits (Sales & Inflow)</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              +₹{totalCredit.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Filter period revenue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Debits (Refunds & Outflow)</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              -₹{totalDebit.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Filter period expenditures</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-600">Entry Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Transactions</option>
            <option value="SALE">Sales (Inflow)</option>
            <option value="RETURN">Customer Returns (Outflow)</option>
            <option value="SUPPLIER_PAYMENT">Supplier Payments</option>
            <option value="EXPENSE">Operating Expenses</option>
            <option value="OPENING_BALANCE">Opening Balance</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-600">Date Range:</label>
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

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Computing double-entry records...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No ledger entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit (Out)</th>
                  <th className="py-3 px-4 text-right">Credit (In)</th>
                  <th className="py-3 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(entry.date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          entry.type === 'SALE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.type === 'RETURN'
                            ? 'bg-rose-100 text-rose-800'
                            : entry.type === 'SUPPLIER_PAYMENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {entry.reference || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      ₹{entry.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Financial Entry"
        maxWidth="md"
      >
        <form onSubmit={handleManualEntrySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={entryType}
                onChange={(e) => {
                  setEntryType(e.target.value);
                  setIsCredit(e.target.value === 'OPENING_BALANCE' || e.target.value === 'SALE');
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="EXPENSE">Operating Expense (Rent, Power, Tea)</option>
                <option value="SUPPLIER_PAYMENT">Supplier Payment</option>
                <option value="OPENING_BALANCE">Capital Injection / Inflow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Flow Direction</label>
              <select
                value={isCredit ? 'CREDIT' : 'DEBIT'}
                onChange={(e) => setIsCredit(e.target.value === 'CREDIT')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DEBIT">Debit (Money Out of Store)</option>
                <option value="CREDIT">Credit (Money Into Store)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              min="0"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
            />
            <Input
              label="Reference / Voucher #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. VOUCH-012"
            />
          </div>

          <Input
            label="Transaction Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Paid showroom electricity bill for March"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Ledger Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
