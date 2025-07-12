import axios from './axios';

export const notificationsAPI = {
  getNotifications: async () => {
    const response = await axios.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await axios.put(`/notifications/${notificationId}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.put('/notifications/mark-all-read');
    return response.data;
  }
};
