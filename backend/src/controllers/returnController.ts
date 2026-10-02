import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const processReturn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staffId = req.user?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { saleId, productId, quantity, reason } = req.body;

    if (!saleId || !productId || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID, Product ID, quantity, and return reason are required.',
      });
    }

    const returnQty = parseInt(quantity, 10);
    if (isNaN(returnQty) || returnQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Return quantity must be a positive integer.',
      });
    }

    // Find sale and sale item
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          where: { productId },
          include: { product: true },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Original sale record not found.',
      });
    }

    const saleItem = sale.items[0];
    if (!saleItem) {
      return res.status(404).json({
        success: false,
        message: 'Product was not found in this sale invoice.',
      });
    }

    const availableToReturn = saleItem.quantity - saleItem.returnedQuantity;
    if (returnQty > availableToReturn) {
      return res.status(400).json({
        success: false,
        message: `Cannot return ${returnQty} units. Only ${availableToReturn} unit(s) eligible for return.`,
      });
    }

    // Calculate proportional refund: unit price * returnQty (accounting for proportionate discount if needed, or straightforward unit price)
    // Proportionate unit price: (saleItem.total / saleItem.quantity) * returnQty
    const unitEffectiveRate = saleItem.total / saleItem.quantity;
    const refundAmount = Math.round(unitEffectiveRate * returnQty * 100) / 100;

    // Execute atomic return transaction:
    // 1. Create Return record
    // 2. Increment product stockQuantity
    // 3. Update saleItem returnedQuantity
    // 4. Update Sale paymentStatus
    // 5. Create LedgerEntry (Debit refund)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Return record
      const returnRecord = await tx.return.create({
        data: {
          saleId: sale.id,
          productId,
          quantity: returnQty,
          reason: reason.trim(),
          refundAmount,
          processedById: staffId,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          sale: {
            select: { id: true, invoiceNumber: true },
          },
          processedBy: {
            select: { id: true, name: true },
          },
        },
      });

      // 2. Restore stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: { increment: returnQty },
        },
      });

      // 3. Update SaleItem returnedQuantity
      await tx.saleItem.update({
        where: { id: saleItem.id },
        data: {
          returnedQuantity: { increment: returnQty },
        },
      });

      // Check all items in sale to see if partially or fully refunded
      const allItems = await tx.saleItem.findMany({
        where: { saleId: sale.id },
      });

      const totalPurchased = allItems.reduce((acc, it) => acc + it.quantity, 0);
      const totalReturned = allItems.reduce((acc, it) => acc + it.returnedQuantity, 0);

      const newStatus = totalReturned >= totalPurchased ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          paymentStatus: newStatus,
        },
      });

      // 4. Create LedgerEntry (Debit refund)
      const lastEntry = await tx.ledgerEntry.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      const previousBalance = lastEntry ? lastEntry.balance : 0;
      const newBalance = previousBalance - refundAmount;

      await tx.ledgerEntry.create({
        data: {
          type: 'RETURN',
          reference: sale.invoiceNumber,
          description: `Product Return Refund: ${saleItem.product.name} (Qty: ${returnQty}) - Inv: ${sale.invoiceNumber}`,
          debit: refundAmount,
          credit: 0,
          balance: newBalance,
          createdById: staffId,
        },
      });

      return returnRecord;
    });

    return res.status(201).json({
      success: true,
      message: 'Product return processed successfully and inventory restored',
      returnRecord: result,
    });
  } catch (error: any) {
    console.error('Process return error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process return',
    });
  }
};

export const getReturns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 25 } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { reason: { contains: q } },
        { sale: { invoiceNumber: { contains: q } } },
        { product: { name: { contains: q } } },
        { product: { sku: { contains: q } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, returns] = await Promise.all([
      prisma.return.count({ where }),
      prisma.return.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, unit: true },
          },
          sale: {
            select: { id: true, invoiceNumber: true, total: true, createdAt: true },
          },
          processedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      success: true,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      returns,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch returns',
    });
  }
};
