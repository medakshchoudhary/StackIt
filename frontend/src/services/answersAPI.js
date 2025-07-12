import axios from './axios';

export const answersAPI = {
  createAnswer: async (questionId, answerData) => {
    const response = await axios.post(`/questions/${questionId}/answers`, answerData);
    return response.data;
  },

  updateAnswer: async (answerId, answerData) => {
    const response = await axios.put(`/answers/${answerId}`, answerData);
    return response.data;
  },

  deleteAnswer: async (answerId) => {
    const response = await axios.delete(`/answers/${answerId}`);
    return response.data;
  },

  voteAnswer: async (answerId, value) => {
    const response = await axios.post(`/answers/${answerId}/vote`, { value });
    return response.data;
  }
};
