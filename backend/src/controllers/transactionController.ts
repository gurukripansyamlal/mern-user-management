import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      staffId,
      page = 1,
      limit = 25,
    } = req.query;

    const where: any = {};

    // Role-based scoping: Staff only see their own transactions unless Admin
    if (req.user?.role !== 'ADMIN') {
      where.staffId = req.user?.id;
    } else if (staffId && typeof staffId === 'string' && staffId !== 'all') {
      where.staffId = staffId;
    }

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod;
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
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

    const [totalCount, sales] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        include: {
          staff: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          returns: true,
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
      sales,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions',
    });
  }
};

export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }],
      },
      include: {
        staff: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, unit: true, sellingPrice: true },
            },
          },
        },
        returns: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            processedBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Role check: if not admin, can only view own transaction
    if (req.user?.role !== 'ADMIN' && sale.staffId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this transaction',
      });
    }

    return res.json({
      success: true,
      sale,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction',
    });
  }
};
