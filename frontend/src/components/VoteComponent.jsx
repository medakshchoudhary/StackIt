import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { votingAPI } from '../services/votingAPI';
import { useAuth } from '../hooks/useAuth';

const VoteComponent = ({ answerId, initialVoteCount = 0, userVote = null, onVoteChange }) => {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleVote = async (value) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const response = await votingAPI.voteOnAnswer(answerId, value);
      
      if (response.success) {
        setVoteCount(response.data.voteCount);
        setCurrentVote(response.data.userVote);
        onVoteChange && onVoteChange(response.data);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          currentVote === 1
            ? 'bg-green-100 text-green-600'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ChevronUp size={20} />
      </button>
      
      <span className={`text-lg font-semibold ${
        voteCount > 0 ? 'text-green-600' : 
        voteCount < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {voteCount}
      </span>
      
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          currentVote === -1
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
};

export default VoteComponent;
