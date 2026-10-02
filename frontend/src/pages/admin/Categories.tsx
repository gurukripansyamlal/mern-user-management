import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

export const Categories: React.FC = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const res = await productService.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
        if (res.success) {
          success('Category updated successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          error(res.message || 'Failed to update category');
        }
      } else {
        const res = await productService.createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        if (res.success) {
          success('Category created successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          error(res.message || 'Failed to create category');
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget._count?.products && deleteTarget._count.products > 0) {
      error(
        `Cannot delete "${deleteTarget.name}" because it contains ${deleteTarget._count.products} products. Reassign or delete products first.`
      );
      setDeleteTarget(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await productService.deleteCategory(deleteTarget.id);
      if (res.success) {
        success('Category removed successfully');
        setDeleteTarget(null);
        fetchCategories();
      } else {
        error(res.message || 'Failed to delete');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Category Hierarchy</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize textile & retail apparel into searchable departments
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
          <p className="text-xs">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c._count?.products || 0} Products
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2">
                  {c.description || <span className="italic">No description provided</span>}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Men's Formal Shirts"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this collection or fabric group"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Deletion is safely prevented if products are assigned.`}
        confirmText="Delete Category"
        isLoading={isSubmitting}
      />
    </div>
  );
};
