import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/db';

export const getStaffList = async (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    if (role && typeof role === 'string' && role !== 'all') {
      where.role = role;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    const staffList = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sales: true, returns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      staff: staffList,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch staff members',
    });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'STAFF', phone, status = 'ACTIVE' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
        phone: phone?.trim() || null,
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create staff member',
    });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, status } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role && (role === 'ADMIN' || role === 'STAFF')) updateData.role = role;
    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) updateData.status = status;

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const duplicate = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id } },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another user with this email address already exists',
        });
      }
      updateData.email = cleanEmail;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update staff member',
    });
  }
};

export const resetStaffPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      message: 'Password reset successfully for staff member',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};

export const toggleStaffStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const nextStatus = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.json({
      success: true,
      message: `Staff member is now ${nextStatus.toLowerCase()}`,
      staff: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle staff status',
    });
  }
};
