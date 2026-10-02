export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sales: number;
    returns: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  description?: string | null;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  status: 'ACTIVE' | 'INACTIVE';
  category?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';
export type PaymentStatus = 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  returnedQuantity: number;
  unitPrice: number;
  costPrice?: number;
  total: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit?: string;
  };
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  staffId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountReceived?: number | null;
  changeGiven?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  staff?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: SaleItem[];
  returns?: ReturnRecord[];
}

export interface ReturnRecord {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  reason: string;
  refundAmount: number;
  processedById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit?: string;
  };
  sale?: {
    id: string;
    invoiceNumber: string;
    total: number;
    createdAt: string;
  };
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export type LedgerType = 'SALE' | 'RETURN' | 'EXPENSE' | 'SUPPLIER_PAYMENT' | 'OPENING_BALANCE';

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  reference?: string | null;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  date: string;
  createdById?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  todayRevenue: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  staffCount: number;
  supplierCount: number;
}
