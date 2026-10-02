import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { User } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  Edit,
  KeyRound,
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  Power,
} from 'lucide-react';

export const Staff: React.FC = () => {
  const { success, error } = useToast();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Reset Modal
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await staffService.getStaff({
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.success) {
        setStaffList(res.staff);
      }
    } catch (err: any) {
      error('Failed to load staff records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, roleFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('STAFF');
    setPhone('');
    setStatus('ACTIVE');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingStaff(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setPhone(user.phone || '');
    setStatus(user.status);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        const res = await staffService.updateStaff(editingStaff.id, {
          name,
          email,
          role,
          phone,
          status,
        });
        if (res.success) {
          success(`Staff profile for ${name} updated`);
          setIsFormOpen(false);
          fetchStaff();
        } else {
          error(res.message || 'Failed to update staff');
        }
      } else {
        const res = await staffService.createStaff({
          name,
          email,
          password,
          role,
          phone,
          status,
        });
        if (res.success) {
          success(`Staff account for ${name} created`);
          setIsFormOpen(false);
          fetchStaff();
        } else {
          error(res.message || 'Failed to create staff');
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await staffService.toggleStatus(user.id);
      if (res.success) {
        success(res.message || 'Status changed');
        fetchStaff();
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle status');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    if (newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    try {
      const res = await staffService.resetPassword(resetTarget.id, newPassword);
      if (res.success) {
        success(`Password updated for ${resetTarget.name}`);
        setResetTarget(null);
        setNewPassword('');
      } else {
        error(res.message || 'Failed to reset password');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Cashier Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure access controls, terminal permissions, and store staff credentials
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="STAFF">Billing Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchStaff} className="p-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="text-xs">Loading staff roster...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mb-2 stroke-1 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No staff accounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-center">Lifetime Bills</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'ADMIN' ? (
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Shield className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {user.phone || <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {user._count?.sales || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={user.status === 'ACTIVE' ? 'emerald' : 'slate'} size="sm">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setResetTarget(user);
                            setNewPassword('');
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-lg transition ${
                            user.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'ACTIVE' ? 'Deactivate Staff' : 'Activate Staff'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Patel"
          />

          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. priya@posdemo.com"
          />

          {!editingStaff && (
            <Input
              label="Temporary Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Access</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="STAFF">Staff (POS Billing Only)</option>
                <option value="ADMIN">Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <Input
            label="Contact Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingStaff ? 'Save Profile' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Password for ${resetTarget?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter a new password for <strong className="text-slate-800">{resetTarget?.email}</strong>.
          </p>

          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 6 characters"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isResetting}>
              Set New Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
