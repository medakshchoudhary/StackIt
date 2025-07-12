import axios from './axios';

export const commentsAPI = {
  getComments: async (answerId, page = 1, limit = 10) => {
    const response = await axios.get(`/answers/${answerId}/comments`, {
      params: { page, limit }
    });
    return response.data;
  },

  createComment: async (answerId, content, parentCommentId = null) => {
    const response = await axios.post(`/answers/${answerId}/comments`, {
      content,
      parentCommentId
    });
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await axios.put(`/answers/comments/${commentId}`, {
      content
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axios.delete(`/answers/comments/${commentId}`);
    return response.data;
  },

  voteComment: async (commentId, value) => {
    const response = await axios.post(`/answers/comments/${commentId}/vote`, {
      value
    });
    return response.data;
  }
};
