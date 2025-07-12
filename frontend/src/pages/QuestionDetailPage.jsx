import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questionsAPI } from '../services/questionsAPI';
import { answersAPI } from '../services/answersAPI';
import RichTextEditor from '../components/RichTextEditor';
import AnswerCard from '../components/AnswerCard';
import AIAnswer from '../components/AIAnswer';
import { timeAgo } from '../utils/helpers';

const answerSchema = z.object({
  content: z.string().min(20, 'Answer must be at least 20 characters')
});

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: ''
    }
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await questionsAPI.getQuestion(id);
        setQuestion(response.data);
      } catch (err) {
        setError('Failed to load question');
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const onSubmitAnswer = async (data) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await answersAPI.createAnswer(id, data);
      setQuestion(prev => ({
        ...prev,
        answers: [...(prev.answers || []), response.data]
      }));
      reset();
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId, value) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await answersAPI.voteAnswer(answerId, value);
      // Update the answer in the question state
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(answer =>
          answer._id === answerId
            ? {
                ...answer,
                voteCount: answer.voteCount + value,
                votes: answer.votes ? [...answer.votes, { user: user._id, value }] : [{ user: user._id, value }]
              }
            : answer
        )
      }));
    } catch (err) {
      console.error('Error voting on answer:', err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await questionsAPI.acceptAnswer(id, answerId);
      setQuestion(prev => ({
        ...prev,
        acceptedAnswer: answerId
      }));
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };

  const handleUpdateAnswer = (answer) => {
    // TODO: Implement answer editing
    console.log('Update answer:', answer);
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await answersAPI.deleteAnswer(answerId);
        setQuestion(prev => ({
          ...prev,
          answers: prev.answers.filter(answer => answer._id !== answerId)
        }));
      } catch (err) {
        console.error('Error deleting answer:', err);
      }
    }
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

  if (error || !question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Question not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Question Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {question.title}
        </h1>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Asked {timeAgo(question.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={16} />
            <span>{question.views} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare size={16} />
            <span>{question.answers?.length || 0} answers</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div 
          className="prose prose-sm max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User size={16} />
            <span>asked by</span>
            <span className="font-medium text-gray-700">
              {question.author?.username || 'Anonymous'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Answer Section */}
      <AIAnswer questionId={id} />

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {question.answers?.length || 0} Answers
        </h2>
        
        <div className="space-y-6">
          {question.answers?.map((answer) => (
            <AnswerCard
              key={answer._id}
              answer={answer}
              questionAuthorId={question.author?._id}
              isAccepted={question.acceptedAnswer === answer._id}
              onVote={handleVote}
              onAccept={handleAcceptAnswer}
              onUpdate={handleUpdateAnswer}
              onDelete={handleDeleteAnswer}
            />
          ))}
        </div>
      </div>

      {/* Answer Form */}
      {isAuthenticated ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Answer
          </h3>
          
          <form onSubmit={handleSubmit(onSubmitAnswer)}>
            <div className="mb-4">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write your answer here..."
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            Sign in to post an answer
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
