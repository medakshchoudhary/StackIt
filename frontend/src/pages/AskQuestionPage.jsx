import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { questionsAPI } from '../services/questionsAPI';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(5, 'Maximum 5 tags allowed')
});

const AskQuestionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: []
    }
  });

  const titleLength = watch('title')?.length || 0;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await questionsAPI.createQuestion(data);
      navigate(`/questions/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Get help from the community by asking a clear, detailed question
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Question Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="What's your programming question? Be specific."
          />
          <div className="flex justify-between mt-1">
            <div>
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {titleLength}/200 characters
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Description *
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Describe your question in detail. Include what you've tried, what you expected, and what actually happened."
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                tags={field.value}
                onChange={field.onChange}
                placeholder="Add up to 5 tags to describe your question"
              />
            )}
          />
          {errors.tags && (
            <p className="text-sm text-red-600 mt-1">{errors.tags.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Tags help others find and answer your question
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for a great question:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Make your title specific and descriptive</li>
          <li>• Include relevant code snippets or error messages</li>
          <li>• Explain what you've already tried</li>
          <li>• Use proper tags to help others find your question</li>
          <li>• Be clear about your expected outcome</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestionPage;
