import axios from './axios';

export const aiAPI = {
  // Generate AI answer for a question
  generateAnswer: async (questionId) => {
    const response = await axios.post(`/ai/answer/${questionId}`);
    return response.data;
  },

  // Get existing AI answer for a question
  getAnswer: async (questionId) => {
    const response = await axios.get(`/ai/answer/${questionId}`);
    return response.data;
  },

  // Vote on AI answer helpfulness
  voteOnAnswer: async (answerId, vote) => {
    const response = await axios.post(`/ai/answer/${answerId}/vote`, { vote });
    return response.data;
  },

  // Get AI statistics
  getStats: async () => {
    const response = await axios.get('/ai/stats');
    return response.data;
  }
};
