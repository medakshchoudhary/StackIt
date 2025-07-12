import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

const QuestionCard = ({ question }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/questions/${question._id}`}
            className="block text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {question.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ThumbsUp size={16} />
                <span>{question.voteCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare size={16} />
                <span>{question.answers?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{question.views || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>by</span>
              <span className="font-medium text-gray-700">
                {question.author?.username || 'Anonymous'}
              </span>
              <span>{timeAgo(question.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
