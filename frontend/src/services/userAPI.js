import axios from './axios';

export const userAPI = {
  searchUsers: async (query) => {
    if (!query || query.length < 2) {
      return { data: { success: true, data: [] } };
    }
    
    const response = await axios.get('/auth/search-users', {
      params: { q: query }
    });
    return response.data;
  }
};
