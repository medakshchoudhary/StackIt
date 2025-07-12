import axios from './axios';

export const votingAPI = {
  voteOnAnswer: async (answerId, value) => {
    const response = await axios.post(`/answers/${answerId}/vote`, { value });
    return response.data;
  },

  acceptAnswer: async (answerId) => {
    const response = await axios.post(`/answers/${answerId}/accept`);
    return response.data;
  }
};
