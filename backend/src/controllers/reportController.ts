import { Request, Response } from 'express';
import prisma from '../services/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      allProducts,
      staffCount,
      supplierCount,
      totalSalesAgg,
      todaySalesAgg,
      recentSales,
      paymentMethodCounts,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
          sellingPrice: true,
        },
      }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.supplier.count({ where: { status: 'ACTIVE' } }),
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.sale.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          staff: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.sale.groupBy({
        by: ['paymentMethod'],
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const lowStockProducts = allProducts.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );
    const outOfStockProducts = allProducts.filter((p) => p.stockQuantity === 0);

    // 7-day sales trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weekSales = await prisma.sale.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    });

    const salesTrendMap: Record<string, { date: string; sales: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      salesTrendMap[key] = { date: key, sales: 0, count: 0 };
    }

    weekSales.forEach((s) => {
      const key = s.createdAt.toISOString().slice(5, 10);
      if (salesTrendMap[key]) {
        salesTrendMap[key].sales += s.total;
        salesTrendMap[key].count += 1;
      }
    });

    const salesTrend = Object.values(salesTrendMap);

    return res.json({
      success: true,
      stats: {
        totalRevenue: totalSalesAgg._sum.total || 0,
        totalTransactions: totalSalesAgg._count.id || 0,
        todayRevenue: todaySalesAgg._sum.total || 0,
        todayTransactions: todaySalesAgg._count.id || 0,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        staffCount,
        supplierCount,
      },
      lowStockAlerts: lowStockProducts.slice(0, 8),
      recentSales,
      salesTrend,
      paymentMethodBreakdown: paymentMethodCounts.map((p) => ({
        method: p.paymentMethod,
        total: p._sum.total || 0,
        count: p._count.id,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard statistics',
    });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
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

    const [sales, aggregates] = await Promise.all([
      prisma.sale.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          subtotal: true,
          discount: true,
          tax: true,
          paymentMethod: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sale.aggregate({
        where,
        _sum: {
          total: true,
          subtotal: true,
          discount: true,
          tax: true,
        },
        _count: { id: true },
      }),
    ]);

    // Group sales by day
    const dailyMap: Record<string, { date: string; revenue: number; count: number; tax: number; discount: number }> = {};
    sales.forEach((s) => {
      const dateKey = s.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenue: 0, count: 0, tax: 0, discount: 0 };
      }
      dailyMap[dateKey].revenue += s.total;
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].tax += s.tax;
      dailyMap[dateKey].discount += s.discount;
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      success: true,
      summary: {
        totalRevenue: aggregates._sum.total || 0,
        totalSubtotal: aggregates._sum.subtotal || 0,
        totalDiscounts: aggregates._sum.discount || 0,
        totalTax: aggregates._sum.tax || 0,
        transactionCount: aggregates._count.id || 0,
        averageOrderValue: aggregates._count.id ? (aggregates._sum.total || 0) / aggregates._count.id : 0,
      },
      dailyBreakdown,
      sales: sales.slice(0, 100),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sales report',
    });
  }
};

export const getProductReport = async (req: Request, res: Response) => {
  try {
    const saleItems = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 20,
    });

    const productIds = saleItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const bestSellers = saleItems
      .map((item) => {
        const prod = productMap.get(item.productId);
        if (!prod) return null;
        const qtySold = item._sum.quantity || 0;
        const revenue = item._sum.total || 0;
        const estimatedCost = prod.costPrice * qtySold;
        const profit = revenue - estimatedCost;

        return {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          categoryName: prod.category.name,
          currentStock: prod.stockQuantity,
          sellingPrice: prod.sellingPrice,
          costPrice: prod.costPrice,
          quantitySold: qtySold,
          totalRevenue: revenue,
          estimatedProfit: profit,
          marginPercent: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      bestSellers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product report',
    });
  }
};

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
    });

    let totalValuationCost = 0;
    let totalValuationRetail = 0;
    let totalStockUnits = 0;

    const lowStockList: any[] = [];
    const outOfStockList: any[] = [];

    products.forEach((p) => {
      totalStockUnits += p.stockQuantity;
      totalValuationCost += p.costPrice * p.stockQuantity;
      totalValuationRetail += p.sellingPrice * p.stockQuantity;

      if (p.stockQuantity === 0) {
        outOfStockList.push(p);
      } else if (p.stockQuantity <= p.lowStockThreshold) {
        lowStockList.push(p);
      }
    });

    return res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        totalValuationCost,
        totalValuationRetail,
        potentialProfit: totalValuationRetail - totalValuationCost,
        lowStockCount: lowStockList.length,
        outOfStockCount: outOfStockList.length,
      },
      lowStockList,
      outOfStockList,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inventory report',
    });
  }
};

export const getPaymentReport = async (req: Request, res: Response) => {
  try {
    const paymentStats = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      _sum: { total: true },
      _count: { id: true },
    });

    const totalSales = paymentStats.reduce((acc, curr) => acc + (curr._sum.total || 0), 0);

    const formatted = paymentStats.map((p) => ({
      paymentMethod: p.paymentMethod,
      totalAmount: p._sum.total || 0,
      transactionCount: p._count.id,
      percentage: totalSales > 0 ? Math.round(((p._sum.total || 0) / totalSales) * 100) : 0,
    }));

    return res.json({
      success: true,
      totalSales,
      paymentBreakdown: formatted,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment report',
    });
  }
};
