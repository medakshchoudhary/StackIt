import axios from './axios';

export const tagsAPI = {
  getTags: async () => {
    const response = await axios.get('/tags');
    return response.data;
  },

  createTag: async (tagData) => {
    const response = await axios.post('/tags', tagData);
    return response.data;
  },

  suggestTags: async (query) => {
    const response = await axios.get(`/tags/suggest?q=${query}`);
    return response.data;
  }
};
