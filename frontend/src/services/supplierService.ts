import api from './api';

export const supplierService = {
  getSuppliers: async (params?: { search?: string; status?: string }) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  getSupplierById: async (id: string) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: any) => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: string, data: any) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};
