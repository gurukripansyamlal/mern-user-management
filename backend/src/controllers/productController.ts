import { Request, Response } from 'express';
import prisma from '../services/db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, categoryId, status, lowStock } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If lowStock filter requested:
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(
        (p) => p.stockQuantity <= p.lowStockThreshold
      );
    }

    return res.json({
      success: true,
      count: filteredProducts.length,
      products: filteredProducts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      sku,
      name,
      categoryId,
      description,
      sellingPrice,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      unit,
      status,
    } = req.body;

    // Validation
    if (!sku || !sku.trim()) {
      return res.status(400).json({ success: false, message: 'SKU is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const numSellingPrice = parseFloat(sellingPrice);
    const numCostPrice = parseFloat(costPrice || '0');
    const numStock = parseInt(stockQuantity || '0', 10);
    const numThreshold = parseInt(lowStockThreshold || '5', 10);

    if (isNaN(numSellingPrice) || numSellingPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be a non-negative number',
      });
    }

    if (isNaN(numCostPrice) || numCostPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost price must be a non-negative number',
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative',
      });
    }

    if (isNaN(numThreshold) || numThreshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold cannot be negative',
      });
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU "${sku.trim().toUpperCase()}" already exists`,
      });
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        categoryId,
        description: description?.trim() || null,
        sellingPrice: numSellingPrice,
        costPrice: numCostPrice,
        stockQuantity: numStock,
        lowStockThreshold: numThreshold,
        unit: unit?.trim() || 'pcs',
        status: status || 'ACTIVE',
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      categoryId,
      description,
      sellingPrice,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      unit,
      status,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData: any = {};

    if (sku) {
      const cleanSku = sku.trim().toUpperCase();
      const duplicateSku = await prisma.product.findFirst({
        where: { sku: cleanSku, NOT: { id } },
      });
      if (duplicateSku) {
        return res.status(409).json({
          success: false,
          message: `Product with SKU "${cleanSku}" already exists`,
        });
      }
      updateData.sku = cleanSku;
    }

    if (name) updateData.name = name.trim();
    if (categoryId) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (unit) updateData.unit = unit.trim();
    if (status) updateData.status = status;

    if (sellingPrice !== undefined) {
      const num = parseFloat(sellingPrice);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Selling price must be non-negative' });
      }
      updateData.sellingPrice = num;
    }

    if (costPrice !== undefined) {
      const num = parseFloat(costPrice);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Cost price must be non-negative' });
      }
      updateData.costPrice = num;
    }

    if (stockQuantity !== undefined) {
      const num = parseInt(stockQuantity, 10);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
      }
      updateData.stockQuantity = num;
    }

    if (lowStockThreshold !== undefined) {
      const num = parseInt(lowStockThreshold, 10);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Threshold cannot be negative' });
      }
      updateData.lowStockThreshold = num;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { saleItems: true, returns: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If product has been part of historical sales or returns, deactivate instead of hard delete
    if (existing._count.saleItems > 0 || existing._count.returns > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return res.json({
        success: true,
        message: 'Product has transaction history and was deactivated instead of deleted.',
        deactivated: true,
      });
    }

    await prisma.product.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Product deleted permanently',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};
