import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { Product, Category, Sale } from '../../types';
import { CheckoutModal } from '../../components/pos/CheckoutModal';
import { InvoiceModal } from '../../components/pos/InvoiceModal';
import { Button } from '../../components/common/Button';
import {
  Search,
  Barcode,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  PackageX,
  CreditCard,
} from 'lucide-react';

export const PosBilling: React.FC = () => {
  const {
    items,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
  } = useCart();

  const { warning, success } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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
      console.error('Failed to load POS catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode/SKU enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuInput.trim()) return;

    const cleanSku = skuInput.trim().toUpperCase();
    const matchedProduct = products.find((p) => p.sku.toUpperCase() === cleanSku);

    if (matchedProduct) {
      if (matchedProduct.stockQuantity <= 0) {
        warning(`"${matchedProduct.name}" (${matchedProduct.sku}) is Out of Stock!`);
      } else {
        addItem(matchedProduct, 1);
        success(`Added "${matchedProduct.name}" to cart`);
        setSkuInput('');
      }
    } else {
      warning(`No product found with SKU "${cleanSku}"`);
    }
  };

  const handleSaleSuccess = (sale: Sale) => {
    setCompletedSale(sale);
    setIsInvoiceOpen(true);
    fetchCatalog(); // Refresh stock levels after checkout
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden bg-slate-100">
      {/* Left / Center: Product Catalog & Search */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        {/* Top Control Bar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by Name or SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick SKU / Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Barcode className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Scan / Type SKU + Enter"
                  className="w-full pl-9 pr-3 py-2 bg-emerald-50/40 border border-emerald-300 rounded-xl text-xs font-mono font-medium text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-sm"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
              <p className="text-xs">Loading showroom inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <PackageX className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for a different textile term or SKU
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stockQuantity <= 0;
                const isLowStock = !isOutOfStock && prod.stockQuantity <= prod.lowStockThreshold;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addItem(prod)}
                    className={`bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-150 relative select-none ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'border-slate-200/80 hover:border-emerald-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold truncate max-w-[120px]">
                          {prod.sku}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {prod.stockQuantity} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {prod.stockQuantity} {prod.unit}
                          </span>
                        )}
                      </div>

                      {/* Product Name & Category */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {prod.category?.name || 'General Apparel'}
                      </p>
                    </div>

                    {/* Price & Add CTA */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm sm:text-base font-extrabold text-slate-900">
                        ₹{prod.sellingPrice.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Cart & Fast Checkout Panel */}
      <div className="w-full lg:w-96 bg-white flex flex-col justify-between shadow-xl z-20 border-t lg:border-t-0 border-slate-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Order Cart</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {itemCount}
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Your cart is currently empty</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click any product on the left or scan a barcode to add it here
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{product.name}</h5>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                    <span>₹{product.sellingPrice}</span>
                    <span>•</span>
                    <span className="text-slate-400">{product.sku}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-7 text-center font-bold text-xs text-slate-900 font-mono">
                    {quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <div className="w-16 text-right font-bold text-xs text-slate-900 font-mono">
                    ₹{(product.sellingPrice * quantity).toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
          {/* Subtotal & Discount row */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Discount (₹)</span>
              </span>
              <input
                type="number"
                min="0"
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-20 text-right px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST ({taxRate}%)</span>
              <span className="font-mono font-medium">₹{taxAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                ₹{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Button
            variant="primary"
            disabled={items.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-600/20 gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay & Print Bill (₹{total.toLocaleString()})</span>
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleSaleSuccess}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={completedSale}
      />
    </div>
  );
};
