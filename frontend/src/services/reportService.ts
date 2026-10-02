import api from './api';

export const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getSalesReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  getProductReport: async () => {
    const response = await api.get('/reports/products');
    return response.data;
  },

  getInventoryReport: async () => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  getPaymentReport: async () => {
    const response = await api.get('/reports/payments');
    return response.data;
  },
};
