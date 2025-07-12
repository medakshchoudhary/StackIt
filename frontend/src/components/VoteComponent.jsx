import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { votingAPI } from '../services/votingAPI';
import { questionsAPI } from '../services/questionsAPI';
import { useAuth } from '../context/AuthContext';

const VoteComponent = ({ 
  type = 'answer', // 'question' or 'answer'
  itemId, // questionId or answerId
  initialVoteCount = 0, 
  userVote = null, 
  onVoteChange 
}) => {
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
      let response;
      
      if (type === 'question') {
        response = await questionsAPI.voteQuestion(itemId, value);
      } else {
        response = await votingAPI.voteOnAnswer(itemId, value);
      }
      
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
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote('up')}
        disabled={loading || !isAuthenticated}
        className={`p-2 rounded-full transition-colors duration-200 ${
          currentVote === 'up'
            ? 'bg-green-100 text-green-600'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${loading || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <ChevronUp size={20} />
      </button>
      
      <span className={`font-semibold text-sm ${
        voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {voteCount}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={loading || !isAuthenticated}
        className={`p-2 rounded-full transition-colors duration-200 ${
          currentVote === 'down'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${loading || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
};

export default VoteComponent;
