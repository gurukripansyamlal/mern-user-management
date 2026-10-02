import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const Products: React.FC = () => {
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formThreshold, setFormThreshold] = useState('5');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({
          search: search || undefined,
          categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        productService.getCategories(),
      ]);

      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
    } catch (err: any) {
      error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormSku(`TEX-${Date.now().toString().slice(-5)}`);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormDescription('');
    setFormSellingPrice('');
    setFormCostPrice('');
    setFormStock('10');
    setFormThreshold('5');
    setFormUnit('pcs');
    setFormStatus('ACTIVE');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategoryId(p.categoryId);
    setFormDescription(p.description || '');
    setFormSellingPrice(String(p.sellingPrice));
    setFormCostPrice(String(p.costPrice));
    setFormStock(String(p.stockQuantity));
    setFormThreshold(String(p.lowStockThreshold));
    setFormUnit(p.unit || 'pcs');
    setFormStatus(p.status);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sell = parseFloat(formSellingPrice);
    const cost = parseFloat(formCostPrice || '0');
    const stock = parseInt(formStock || '0', 10);
    const threshold = parseInt(formThreshold || '5', 10);

    if (isNaN(sell) || sell < 0) {
      error('Selling price cannot be negative');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      error('Cost price cannot be negative');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      error('Stock quantity cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sku: formSku,
        name: formName,
        categoryId: formCategoryId,
        description: formDescription,
        sellingPrice: sell,
        costPrice: cost,
        stockQuantity: stock,
        lowStockThreshold: threshold,
        unit: formUnit,
        status: formStatus,
      };

      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct.id, payload);
        if (res.success) {
          success(`Product "${formName}" updated successfully`);
          setIsFormOpen(false);
          fetchData();
        } else {
          error(res.message || 'Failed to update');
        }
      } else {
        const res = await productService.createProduct(payload);
        if (res.success) {
          success(`Product "${formName}" created successfully`);
          setIsFormOpen(false);
          fetchData();
        } else {
          error(res.message || 'Failed to create');
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    setIsSubmitting(true);
    try {
      const res = await productService.deleteProduct(deleteProductTarget.id);
      if (res.success) {
        success(res.message || 'Product deleted successfully');
        setDeleteProductTarget(null);
        fetchData();
      } else {
        error(res.message || 'Failed to delete');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Product */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, search and track retail inventory levels & pricing
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchData} className="p-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Loading product catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No products match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU / Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Margin</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isOutOfStock = p.stockQuantity === 0;
                  const isLowStock = !isOutOfStock && p.stockQuantity <= p.lowStockThreshold;
                  const margin =
                    p.sellingPrice > 0
                      ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{p.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        ₹{p.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                        {margin}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-2.5 h-2.5" />}
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={p.status === 'ACTIVE' ? 'emerald' : 'slate'} size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteProductTarget(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Delete or Deactivate Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Textile Product' : 'Add New Textile Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value.toUpperCase())}
              placeholder="e.g. M-SHT-COT-01"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                required
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Product Name"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Cotton Formal Shirt"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fabric / Product Description
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Details on yarn, weave, GSM, sleeve style, etc."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              min="0"
              step="any"
              required
              value={formSellingPrice}
              onChange={(e) => setFormSellingPrice(e.target.value)}
              placeholder="1499"
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              min="0"
              step="any"
              required
              value={formCostPrice}
              onChange={(e) => setFormCostPrice(e.target.value)}
              placeholder="750"
            />
            <Input
              label="Stock Qty"
              type="number"
              min="0"
              required
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
              placeholder="25"
            />
            <Input
              label="Low Alert Limit"
              type="number"
              min="0"
              required
              value={formThreshold}
              onChange={(e) => setFormThreshold(e.target.value)}
              placeholder="5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="mtr">Meters (mtr)</option>
                <option value="set">Sets (set)</option>
                <option value="roll">Rolls (roll)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">Active (Available on POS)</option>
                <option value="INACTIVE">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingProduct ? 'Save Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete/Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete / Deactivate Product"
        message={`Are you sure you want to remove "${deleteProductTarget?.name}"? If it has historical sale or return records, it will be safely deactivated to protect audit integrity.`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};
