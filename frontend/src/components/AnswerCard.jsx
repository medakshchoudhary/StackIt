import React, { useState } from 'react';
import { Check, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import VoteComponent from './VoteComponent';
import CommentsSection from './CommentsSection';

const AnswerCard = ({ answer, questionAuthorId, isAccepted, onVote, onAccept, onUpdate, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const isAuthor = user?._id === answer.author?._id;
  const isQuestionAuthor = user?._id === questionAuthorId;
  const canAccept = isQuestionAuthor && !isAccepted;

  const handleAccept = async () => {
    if (!canAccept) return;
    
    setIsLoading(true);
    try {
      await onAccept(answer._id);
    } catch (error) {
      console.error('Error accepting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserVote = () => {
    if (!user || !answer.votes) return null;
    const userVote = answer.votes.find(vote => vote.user === user._id);
    return userVote ? userVote.vote : null;
  };

  const handleVoteChange = (voteData) => {
    if (onVote) {
      onVote(answer._id, voteData);
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-6 ${isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      {isAccepted && (
        <div className="flex items-center gap-2 mb-4 text-green-600">
          <Check size={20} />
          <span className="font-medium">Accepted Answer</span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2">
          <VoteComponent
            type="answer"
            itemId={answer._id}
            initialVoteCount={answer.voteCount || 0}
            userVote={getUserVote()}
            onVoteChange={handleVoteChange}
          />

          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Accept this answer"
            >
              <Check size={20} />
            </button>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1">
          <div 
            className="prose prose-sm max-w-none mb-4 question-description"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>answered by</span>
              <span className="font-medium text-gray-700">
                {answer.author?.username || 'Anonymous'}
              </span>
              <span>{formatDate(answer.createdAt)}</span>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdate(answer)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit answer"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(answer._id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete answer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection answerId={answer._id} />
    </div>
  );
};

export default AnswerCard;
