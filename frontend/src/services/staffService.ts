import api from './api';

export const staffService = {
  getStaff: async (params?: { search?: string; role?: string; status?: string }) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  createStaff: async (data: any) => {
    const response = await api.post('/staff', data);
    return response.data;
  },

  updateStaff: async (id: string, data: any) => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const response = await api.patch(`/staff/${id}/password`, { newPassword });
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch(`/staff/${id}/status`);
    return response.data;
  },
};
