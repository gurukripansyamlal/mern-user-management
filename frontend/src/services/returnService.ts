import api from './api';

export const returnService = {
  processReturn: async (data: {
    saleId: string;
    productId: string;
    quantity: number;
    reason: string;
  }) => {
    const response = await api.post('/returns', data);
    return response.data;
  },

  getReturns: async (params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/returns', { params });
    return response.data;
  },
};
