import { Request, Response } from 'express';
import prisma from '../services/db';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { companyName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      suppliers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch suppliers',
    });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    return res.json({
      success: true,
      supplier,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch supplier',
    });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, companyName, phone, email, address, status = 'ACTIVE' } = req.body;

    if (!name || !companyName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Contact name, company name, and phone number are required',
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      supplier,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create supplier',
    });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, companyName, phone, email, address, status } = req.body;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (companyName) updateData.companyName = companyName.trim();
    if (phone) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (status) updateData.status = status;

    const updated = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Supplier updated successfully',
      supplier: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update supplier',
    });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await prisma.supplier.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete supplier',
    });
  }
};
