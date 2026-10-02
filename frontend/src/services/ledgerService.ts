import api from './api';

export const ledgerService = {
  getLedger: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/ledger', { params });
    return response.data;
  },

  createManualEntry: async (data: {
    type: string;
    description: string;
    amount: number;
    isCredit: boolean;
    reference?: string;
  }) => {
    const response = await api.post('/ledger', data);
    return response.data;
  },
};
