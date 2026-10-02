import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Package, AlertTriangle, Edit, RefreshCw } from 'lucide-react';

export const MobileProducts: React.FC = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
    } catch (err) {
      error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku(`TEX-${Date.now().toString().slice(-4)}`);
    setCategoryId(categories[0]?.id || '');
    setSellingPrice('');
    setCostPrice('');
    setStockQuantity('10');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setSellingPrice(String(p.sellingPrice));
    setCostPrice(String(p.costPrice));
    setStockQuantity(String(p.stockQuantity));
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        sku,
        categoryId,
        sellingPrice: parseFloat(sellingPrice),
        costPrice: parseFloat(costPrice || '0'),
        stockQuantity: parseInt(stockQuantity || '0', 10),
      };

      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct.id, payload);
        if (res.success) {
          success('Product updated');
          setIsModalOpen(false);
          fetchCatalog();
        }
      } else {
        const res = await productService.createProduct(payload);
        if (res.success) {
          success('Product created');
          setIsModalOpen(false);
          fetchCatalog();
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Apparel Catalog</h2>
          <p className="text-[11px] text-slate-400">Mobile stock inspection</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add SKU</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            selectedCat === 'all'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCat === c.id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Mobile Product Cards List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-emerald-400" />
            <p className="text-xs">Loading items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="text-xs">No matching products found</p>
          </div>
        ) : (
          filtered.map((prod) => {
            const isOut = prod.stockQuantity === 0;
            const isLow = !isOut && prod.stockQuantity <= prod.lowStockThreshold;

            return (
              <div
                key={prod.id}
                className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400">{prod.sku}</span>
                    {isOut ? (
                      <span className="text-[9px] font-bold px-1.5 rounded bg-rose-950 text-rose-300">
                        Out
                      </span>
                    ) : isLow ? (
                      <span className="text-[9px] font-bold px-1.5 rounded bg-amber-950 text-amber-300">
                        Low Stock
                      </span>
                    ) : null}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold font-mono">
                      ₹{prod.sellingPrice}
                    </span>
                    <span>•</span>
                    <span>
                      Stock: <strong className="text-white">{prod.stockQuantity}</strong> {prod.unit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(prod)}
                  className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Edit Product"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        maxWidth="sm"
      >
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <Input
            label="Product Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="SKU Code"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Selling Price (₹)"
              type="number"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
            <Input
              label="Stock Qty"
              type="number"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
