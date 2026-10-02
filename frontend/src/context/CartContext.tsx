import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  setDiscount: (discount: number) => void;
  setTaxRate: (rate: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState<number>(0);
  const [taxRate, setTaxRateState] = useState<number>(5); // Default 5% Textile GST
  const { warning } = useToast();

  const addItem = (product: Product, quantityToAdd: number = 1): boolean => {
    if (product.stockQuantity <= 0) {
      warning(`"${product.name}" is currently out of stock.`);
      return false;
    }

    const existingIndex = items.findIndex((it) => it.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const proposedQty = currentQty + quantityToAdd;

      if (proposedQty > product.stockQuantity) {
        warning(
          `Cannot add more. Stock limit for "${product.name}" is ${product.stockQuantity} ${product.unit}.`
        );
        return false;
      }

      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: proposedQty } : item
        )
      );
      return true;
    } else {
      if (quantityToAdd > product.stockQuantity) {
        warning(
          `Cannot add ${quantityToAdd}. Only ${product.stockQuantity} in stock for "${product.name}".`
        );
        return false;
      }

      setItems((prev) => [...prev, { product, quantity: quantityToAdd }]);
      return true;
    }
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeItem(productId);
      return true;
    }

    const item = items.find((it) => it.product.id === productId);
    if (!item) return false;

    if (quantity > item.product.stockQuantity) {
      warning(
        `Cannot set quantity to ${quantity}. Maximum available stock is ${item.product.stockQuantity}.`
      );
      return false;
    }

    setItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity } : it))
    );
    return true;
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const setDiscount = (amount: number) => {
    setDiscountState(Math.max(0, amount));
  };

  const setTaxRate = (rate: number) => {
    setTaxRateState(Math.max(0, rate));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountState(0);
  };

  // Calculations
  const { subtotal, itemCount } = useMemo(() => {
    let sub = 0;
    let count = 0;
    items.forEach((item) => {
      sub += item.product.sellingPrice * item.quantity;
      count += item.quantity;
    });
    return { subtotal: sub, itemCount: count };
  }, [items]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(((taxable * taxRate) / 100) * 100) / 100;
  }, [subtotal, discount, taxRate]);

  const total = useMemo(() => {
    const taxable = Math.max(0, subtotal - discount);
    return Math.round((taxable + taxAmount) * 100) / 100;
  }, [subtotal, discount, taxAmount]);

  return (
    <CartContext.Provider
      value={{
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
        setTaxRate,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
