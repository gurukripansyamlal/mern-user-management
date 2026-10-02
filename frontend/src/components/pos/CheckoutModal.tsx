import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { posService } from '../../services/posService';
import { Banknote, CreditCard, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import { Sale } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { items, subtotal, discount, taxRate, taxAmount, total, clearCart } = useCart();
  const { success, error } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default received to total on open if empty
  const numReceived = parseFloat(amountReceived) || 0;
  const changeGiven = paymentMethod === 'CASH' ? Math.max(0, numReceived - total) : 0;

  const handleQuickCash = (added: number) => {
    const current = parseFloat(amountReceived) || 0;
    setAmountReceived(String(current + added));
  };

  const handleExactCash = () => {
    setAmountReceived(String(total));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error('Cart is empty');
      return;
    }

    if (paymentMethod === 'CASH') {
      if (numReceived < total) {
        error(`Amount received (₹${numReceived}) is less than total (₹${total})`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await posService.checkout({
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        discount,
        taxRate,
        paymentMethod,
        amountReceived: paymentMethod === 'CASH' ? numReceived : total,
        notes: notes || undefined,
      });

      if (response.success && response.sale) {
        success('Sale completed successfully!');
        clearCart();
        onSuccess(response.sale);
        onClose();
      } else {
        error(response.message || 'Checkout failed');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Sale Checkout" maxWidth="xl">
      <form onSubmit={handleCheckout} className="space-y-5">
        {/* Bill Summary Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Grand Total Payable</span>
            <div className="text-2xl font-black text-slate-900">₹{total.toLocaleString()}</div>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div>Items: <span className="font-semibold text-slate-800">{items.reduce((s, i) => s + i.quantity, 0)} pcs</span></div>
            <div>Tax (5%): <span className="font-semibold text-slate-800">₹{taxAmount}</span></div>
            {discount > 0 && <div className="text-emerald-600">Discount: -₹{discount}</div>}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CASH');
                setAmountReceived(String(total));
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
              <span className="text-xs">Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                paymentMethod === 'CARD'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-800 font-bold shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Credit/Debit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                paymentMethod === 'UPI'
                  ? 'border-purple-500 bg-purple-50/50 text-purple-800 font-bold shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              <QrCode className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">UPI / QR Code</span>
            </button>
          </div>
        </div>

        {/* Dynamic Payment Method Details */}
        {paymentMethod === 'CASH' && (
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
            <div>
              <Input
                label="Amount Tendered / Received (₹)"
                type="number"
                step="any"
                required
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Enter cash received"
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Quick add:</span>
              <button
                type="button"
                onClick={handleExactCash}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800 transition"
              >
                Exact (₹{total})
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(500)}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800 transition"
              >
                +₹500
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(1000)}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800 transition"
              >
                +₹1000
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(2000)}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800 transition"
              >
                +₹2000
              </button>
            </div>

            {/* Change Return Box */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-emerald-200 text-xs">
              <span className="font-semibold text-slate-700">Change to return to customer:</span>
              <span className={`text-base font-bold ${numReceived >= total ? 'text-emerald-700' : 'text-rose-600'}`}>
                ₹{changeGiven.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'UPI' && (
          <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center gap-4">
            <div className="w-20 h-20 bg-white p-2 rounded-lg border border-purple-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <QrCode className="w-16 h-16 text-purple-700" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">Scan Showroom UPI QR</p>
              <p className="text-slate-600">VPA: <span className="font-mono font-semibold text-purple-700">cloudhouse.pos@icici</span></p>
              <p className="text-slate-500 text-[11px]">Instant settlement verification via soundbox or payment confirmation.</p>
            </div>
          </div>
        )}

        {paymentMethod === 'CARD' && (
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-slate-900">Card Swiped / Tapped on POS Machine</p>
              <p className="text-slate-500">Supports Visa, MasterCard, RuPay & Amex.</p>
            </div>
          </div>
        )}

        {/* Customer Information (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Customer Name (Optional)"
            placeholder="e.g. Vikram Malhotra"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            label="Customer Phone (Optional)"
            placeholder="e.g. +91 98765 43210"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} className="min-w-[150px]">
            <span>Confirm & Print Bill</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
