import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getLedgerEntries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const where: any = {};

    if (type && typeof type === 'string' && type !== 'all') {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === 'string') {
        where.date.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, entries, aggregates] = await Promise.all([
      prisma.ledgerEntry.count({ where }),
      prisma.ledgerEntry.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.ledgerEntry.aggregate({
        where,
        _sum: {
          debit: true,
          credit: true,
        },
      }),
    ]);

    const latestEntry = await prisma.ledgerEntry.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      currentBalance: latestEntry?.balance || 0,
      totalCredit: aggregates._sum.credit || 0,
      totalDebit: aggregates._sum.debit || 0,
      entries,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ledger entries',
    });
  }
};

export const createManualLedgerEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, description, amount, isCredit, reference } = req.body;

    if (!type || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Type, description, and amount are required',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    const credit = isCredit ? numAmount : 0;
    const debit = !isCredit ? numAmount : 0;

    const lastEntry = await prisma.ledgerEntry.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const previousBalance = lastEntry ? lastEntry.balance : 0;
    const newBalance = previousBalance + credit - debit;

    const entry = await prisma.ledgerEntry.create({
      data: {
        type,
        reference: reference?.trim() || null,
        description: description.trim(),
        credit,
        debit,
        balance: newBalance,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Ledger entry recorded successfully',
      entry,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create ledger entry',
    });
  }
};
