import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, X, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questionsAPI } from '../services/questionsAPI';
import { tagsAPI } from '../services/tagsAPI';
import QuestionCard from '../components/QuestionCard';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, [searchQuery, selectedTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getQuestions(1, 10, searchQuery, selectedTag);
      setQuestions(response.data || []);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getTags();
      setAvailableTags(response.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setShowTagFilter(false);
  };

  const clearTagFilter = () => {
    setSelectedTag('');
  };

  const handleVoteChange = (questionId, voteData) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q._id === questionId 
          ? { ...q, voteCount: voteData.voteCount, userVote: voteData.userVote }
          : q
      )
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">All Questions</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {questions.length} questions found
          </p>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/ask"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            <Plus size={16} />
            <span className="text-sm sm:text-base">Ask Question</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Tag Filter */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            <Filter size={14} />
            <span>Filter by Tag</span>
          </button>
          
          {selectedTag && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              <span>Tag: {selectedTag}</span>
              <button
                onClick={clearTagFilter}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        
        {showTagFilter && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select a tag to filter:</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => handleTagFilter(tag.name)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition-colors"
                >
                  {tag.name}
                  {tag.questionCount > 0 && (
                    <span className="ml-1 text-xs text-gray-500">({tag.questionCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-base sm:text-lg mb-4">No questions found</p>
              {isAuthenticated ? (
                <Link
                  to="/ask"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  <Plus size={16} />
                  <span className="text-sm sm:text-base">Ask the first question</span>
                </Link>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    Sign in to ask your first question
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <span className="text-sm sm:text-base">Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="transform hover:scale-[1.02] transition-transform duration-200">
              <QuestionCard question={question} onVoteChange={handleVoteChange} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
