import axios from './axios';

export const votingAPI = {
  voteOnAnswer: async (answerId, value) => {
    const response = await axios.post(`/votes/answers/${answerId}/vote`, { value });
    return response.data;
  }
};
