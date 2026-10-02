import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

interface CartItemInput {
  productId: string;
  quantity: number;
}

export const createSale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staffId = req.user?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: 'Staff authentication required' });
    }

    const {
      items,
      customerName,
      customerPhone,
      discount = 0,
      taxRate = 5, // default 5% textile tax
      paymentMethod = 'CASH',
      amountReceived,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please add items to checkout.',
      });
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CARD', 'UPI'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`,
      });
    }

    // Fetch products and validate stock
    const productIds = items.map((i: CartItemInput) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      total: number;
      productName: string;
    }> = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item quantity specified.',
        });
      }

      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${item.productId}`,
        });
      }

      if (product.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently inactive.`,
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}`,
        });
      }

      const lineTotal = product.sellingPrice * quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        quantity,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
        total: lineTotal,
        productName: product.name,
      });
    }

    const discountAmount = Math.max(0, parseFloat(discount) || 0);
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * (parseFloat(taxRate) || 0)) / 100 * 100) / 100;
    const finalTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    let received = amountReceived ? parseFloat(amountReceived) : finalTotal;
    let change = 0;

    if (paymentMethod === 'CASH') {
      if (received < finalTotal) {
        return res.status(400).json({
          success: false,
          message: `Amount received (₹${received}) is less than the total bill amount (₹${finalTotal})`,
        });
      }
      change = Math.round((received - finalTotal) * 100) / 100;
    } else {
      received = finalTotal;
      change = 0;
    }

    // Generate unique sequential invoice number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.sale.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

    // Execute atomic transaction:
    // 1. Create Sale
    // 2. Create SaleItems
    // 3. Decrement Product Stocks
    // 4. Create LedgerEntry
    const completedSale = await prisma.$transaction(async (tx) => {
      // Create Sale
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          staffId,
          customerName: customerName?.trim() || null,
          customerPhone: customerPhone?.trim() || null,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          tax: taxAmount,
          total: finalTotal,
          paymentMethod,
          paymentStatus: 'PAID',
          amountReceived: received,
          changeGiven: change,
          notes: notes?.trim() || null,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              costPrice: item.costPrice,
              total: item.total,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, unit: true },
              },
            },
          },
          staff: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Decrement product stocks
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      // Ledger entry: Sales revenue
      const lastEntry = await tx.ledgerEntry.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      const previousBalance = lastEntry ? lastEntry.balance : 0;
      const newBalance = previousBalance + finalTotal;

      await tx.ledgerEntry.create({
        data: {
          type: 'SALE',
          reference: invoiceNumber,
          description: `Retail POS Sale: ${invoiceNumber} (${paymentMethod})`,
          credit: finalTotal,
          debit: 0,
          balance: newBalance,
          createdById: staffId,
        },
      });

      return sale;
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      sale: completedSale,
    });
  } catch (error: any) {
    console.error('POS Sale error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process checkout transaction',
    });
  }
};
