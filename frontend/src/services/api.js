import axios from './axios';

// Export all API services
export { authAPI } from './authAPI';
export { questionsAPI } from './questionsAPI';
export { answersAPI } from './answersAPI';

// Notifications API
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
    const response = await axios.put('/notifications');
    return response.data;
  }
};

// Tags API
export const tagsAPI = {
  getTags: async () => {
    const response = await axios.get('/tags');
    return response.data;
  },

  suggestTags: async (query) => {
    const response = await axios.get(`/tags/suggest?q=${query}`);
    return response.data;
  }
};
