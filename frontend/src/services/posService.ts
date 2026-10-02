import api from './api';

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  taxRate?: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
  amountReceived?: number;
  notes?: string;
}

export const posService = {
  checkout: async (payload: CheckoutPayload) => {
    const response = await api.post('/pos/checkout', payload);
    return response.data;
  },

  getTransactions: async (params?: {
    search?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    staffId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};
