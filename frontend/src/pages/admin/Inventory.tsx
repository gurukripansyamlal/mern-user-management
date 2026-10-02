import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  Search,
  RefreshCw,
  PlusCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { success, error } = useToast();
  const [report, setReport] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Stock Adjustment
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getInventoryReport();
      if (res.success) {
        setReport(res.summary);
        setProducts(res.products);
      }
    } catch (err: any) {
      error('Failed to load inventory valuation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterTab === 'low') {
      return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    }
    if (filterTab === 'out') {
      return p.stockQuantity === 0;
    }
    return true;
  });

  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const added = parseInt(adjustmentQty, 10);
    if (isNaN(added)) return;

    const newStock = Math.max(0, selectedProduct.stockQuantity + added);

    setIsAdjusting(true);
    try {
      const res = await productService.updateProduct(selectedProduct.id, {
        stockQuantity: newStock,
      });

      if (res.success) {
        success(`Stock updated for "${selectedProduct.name}" to ${newStock} ${selectedProduct.unit}`);
        setSelectedProduct(null);
        setAdjustmentQty('');
        fetchInventory();
      } else {
        error(res.message || 'Failed to update stock');
      }
    } catch (err: any) {
      error(err.message || 'Error updating stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Showroom Inventory Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of units, automated reorder thresholds, and warehouse valuation
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchInventory} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </Button>
      </div>

      {/* Summary Valuation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Physical Units</span>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {report?.totalStockUnits?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {report?.totalProducts || 0} unique SKUs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Valuation at Cost</span>
          <div className="mt-2 text-2xl font-black text-blue-700 font-mono">
            ₹{report?.totalValuationCost?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Invested purchase capital</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Retail Inventory Value</span>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono">
            ₹{report?.totalValuationRetail?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Expected showroom revenue</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Potential Gross Margin</span>
          <div className="mt-2 text-2xl font-black text-purple-700 font-mono">
            ₹{report?.potentialProfit?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Unrealized gross profit</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setFilterTab('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterTab === 'low'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock ({report?.lowStockCount || 0})</span>
          </button>
          <button
            onClick={() => setFilterTab('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterTab === 'out'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <PackageX className="w-3.5 h-3.5 text-rose-500" />
            <span>Out of Stock ({report?.outOfStockCount || 0})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Computing inventory status...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Boxes className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No items match this stock filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Retail</th>
                  <th className="py-3 px-4 text-center">Available Stock</th>
                  <th className="py-3 px-4 text-center">Min Threshold</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-center">Quick Stock Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isOut = p.stockQuantity === 0;
                  const isLow = !isOut && p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{p.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category?.name || 'Textiles'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        ₹{p.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm font-mono text-slate-900">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {p.lowStockThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Adequate'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setAdjustmentQty('10');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Adjust Showroom Stock"
        maxWidth="sm"
      >
        <form onSubmit={handleStockAdjustSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">{selectedProduct?.name}</p>
            <p className="font-mono text-slate-500">SKU: {selectedProduct?.sku}</p>
            <p className="text-slate-600">
              Current Available Stock: <strong className="font-mono text-slate-900">{selectedProduct?.stockQuantity} {selectedProduct?.unit}</strong>
            </p>
          </div>

          <Input
            label="Quantity to Add / Restock"
            type="number"
            required
            value={adjustmentQty}
            onChange={(e) => setAdjustmentQty(e.target.value)}
            placeholder="e.g. 20 (or negative number to write-off)"
            helperText="Enter positive number to add new shipment quantity"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isAdjusting}>
              Update Stock Quantity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
