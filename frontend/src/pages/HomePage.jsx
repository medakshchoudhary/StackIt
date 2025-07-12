import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questionsAPI } from '../services/questionsAPI';
import QuestionCard from '../components/QuestionCard';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await questionsAPI.getQuestions();
        setQuestions(response.data || []);
      } catch (err) {
        setError('Failed to fetch questions');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="text-gray-600 mt-2">
            {questions.length} questions found
          </p>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/ask"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Ask Question</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No questions found</p>
            {isAuthenticated ? (
              <Link
                to="/ask"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Ask the first question</span>
              </Link>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">
                  Sign in to ask your first question
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
