import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, CheckCircle, Download, ShoppingBag } from 'lucide-react';
import { Sale } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice / Receipt" maxWidth="xl">
      <div className="space-y-4">
        {/* Printable Invoice Container */}
        <div
          ref={invoiceRef}
          id="printable-invoice"
          className="bg-white border border-slate-200 rounded-xl p-6 text-slate-800 shadow-sm print:border-none print:shadow-none print:p-0"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              CLOUDHOUSE TEXTILES & APPAREL
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              102 Fashion Avenue, Central Market, MG Road
            </p>
            <p className="text-xs text-slate-500">
              GSTIN: 27AABCT3518Q1ZV | Phone: +91 22 4567 8900
            </p>
            <div className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 rounded text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Retail Tax Invoice
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 text-xs py-3 border-b border-dashed border-slate-300 gap-2">
            <div>
              <p><span className="text-slate-500">Invoice No:</span> <strong className="font-mono text-slate-900">{sale.invoiceNumber}</strong></p>
              <p><span className="text-slate-500">Date & Time:</span> <span className="font-medium text-slate-800">{formattedDate}</span></p>
              <p><span className="text-slate-500">Billed By:</span> <span className="font-medium text-slate-800">{sale.staff?.name || 'Store Cashier'}</span></p>
            </div>
            <div className="text-right">
              {sale.customerName && (
                <p><span className="text-slate-500">Customer:</span> <strong className="font-medium text-slate-900">{sale.customerName}</strong></p>
              )}
              {sale.customerPhone && (
                <p><span className="text-slate-500">Phone:</span> <span className="font-mono text-slate-800">{sale.customerPhone}</span></p>
              )}
              <p><span className="text-slate-500">Payment:</span> <strong className="uppercase text-emerald-700 font-bold">{sale.paymentMethod} ({sale.paymentStatus})</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-1.5">Item & SKU</th>
                  <th className="pb-1.5 text-center">Qty</th>
                  <th className="pb-1.5 text-right">Rate</th>
                  <th className="pb-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-2 pr-2">
                      <p className="font-semibold text-slate-900 leading-tight">
                        {item.product?.name || 'Textile Item'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.product?.sku || 'SKU'}
                      </p>
                    </td>
                    <td className="py-2 text-center font-medium">
                      {item.quantity} {item.product?.unit || 'pcs'}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">₹{sale.subtotal.toFixed(2)}</span>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Promotional Discount</span>
                <span className="font-mono">-₹{sale.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST / Taxes (5%)</span>
              <span className="font-mono font-medium">₹{sale.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="font-mono text-base">₹{sale.total.toFixed(2)}</span>
            </div>

            {sale.paymentMethod === 'CASH' && sale.amountReceived && (
              <div className="pt-2 text-[11px] text-slate-500 flex justify-between">
                <span>Amount Tendered: ₹{sale.amountReceived.toFixed(2)}</span>
                <span>Change Returned: ₹{(sale.changeGiven || 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Barcode representation & Footer Notes */}
          <div className="pt-4 text-center text-[10px] text-slate-500 space-y-2">
            <div className="font-mono tracking-widest text-slate-400 select-none text-xs">
              *||| | |||| || ||| |||| | |||*
            </div>
            <p className="font-medium text-slate-600">
              Thank you for shopping with us!
            </p>
            <p className="leading-tight">
              Goods once sold can be returned/exchanged within 14 days with original tags and invoice.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
