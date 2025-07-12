import axios from './axios';

export const tagsAPI = {
  getTags: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    
    const response = await axios.get(`/tags?${params}`);
    return response.data;
  },

  createTag: async (tagData) => {
    const response = await axios.post('/tags', tagData);
    return response.data;
  },

  suggestTags: async (query) => {
    const response = await axios.get(`/tags/suggest?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
