import axios from './axios';

export const questionsAPI = {
  getQuestions: async (page = 1, limit = 10, search = '', tag = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    
    const response = await axios.get(`/questions?${params}`);
    return response.data;
  },

  getQuestion: async (id) => {
    const response = await axios.get(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await axios.post('/questions', questionData);
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await axios.put(`/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await axios.delete(`/questions/${id}`);
    return response.data;
  },

  acceptAnswer: async (questionId, answerId) => {
    const response = await axios.post(`/questions/${questionId}/accept-answer/${answerId}`);
    return response.data;
  }
};
