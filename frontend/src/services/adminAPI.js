import axios from './axios';

export const adminAPI = {
  getUsers: async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  },

  banUser: async (userId, reason) => {
    const response = await axios.patch(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  getSiteStats: async () => {
    const response = await axios.get('/admin/stats');
    return response.data;
  },

  getFlaggedContent: async () => {
    const response = await axios.get('/admin/flagged-content');
    return response.data;
  },

  sendGlobalNotification: async (message) => {
    const response = await axios.post('/admin/global-notification', { message });
    return response.data;
  }
};
