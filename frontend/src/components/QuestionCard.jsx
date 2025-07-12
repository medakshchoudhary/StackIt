import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

const QuestionCard = ({ question }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 hover:border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to={`/questions/${question._id}`}
            className="block text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2 transition-colors duration-200"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
            {question.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
            {question.tags?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full">
                +{question.tags.length - 3} more
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-2 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200">
                <ThumbsUp size={14} className="sm:w-4 sm:h-4" />
                <span>{question.voteCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-green-600 transition-colors duration-200">
                <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                <span>{question.answers?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200">
                <Eye size={14} className="sm:w-4 sm:h-4" />
                <span>{question.views || 0}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm">
                by <span className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  {question.author?.username || 'Anonymous'}
                </span>
              </span>
              <span className="text-xs sm:text-sm text-gray-400">
                {timeAgo(question.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
