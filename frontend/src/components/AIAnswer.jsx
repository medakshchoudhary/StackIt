import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Brain, Zap, Star, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { aiAPI } from '../services/aiAPI';
import { useAuth } from '../context/AuthContext';

const AIAnswer = ({ questionId }) => {
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [votes, setVotes] = useState({ helpful: 0, unhelpful: 0 });
  const [userVote, setUserVote] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated } = useAuth();

  const checkExistingAnswer = useCallback(async () => {
    try {
      const response = await aiAPI.getAnswer(questionId);
      setAiAnswer(response.data);
      setVotes({
        helpful: response.data.helpfulVotes,
        unhelpful: response.data.unhelpfulVotes
      });
      setShowAnswer(true);
    } catch {
      // No existing answer, that's fine
    }
  }, [questionId]);

  useEffect(() => {
    checkExistingAnswer();
  }, [checkExistingAnswer]);

  const generateAnswer = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await aiAPI.generateAnswer(questionId);
      setAiAnswer(response.data);
      setVotes({
        helpful: response.data.helpfulVotes,
        unhelpful: response.data.unhelpfulVotes
      });
      setShowAnswer(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate AI answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    if (!aiAnswer) return;
    
    try {
      const response = await aiAPI.voteOnAnswer(aiAnswer._id, vote);
      setVotes({
        helpful: response.data.helpfulVotes,
        unhelpful: response.data.unhelpfulVotes
      });
      setUserVote(response.data.userVote);
    } catch (error) {
      console.error('Error voting on AI answer:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const copyAnswer = async () => {
    if (!aiAnswer) return;
    
    try {
      await navigator.clipboard.writeText(aiAnswer.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy answer:', error);
    }
  };

  // Check if answer is long (more than 300 characters)
  const isLongAnswer = aiAnswer?.answer?.length > 300;
  const shouldShowExpand = isLongAnswer && !isExpanded;

  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      {/* AI Answer Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-t-2xl p-3 sm:p-4 lg:p-6 shadow-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur opacity-75"></div>
              <div className="relative bg-white rounded-full p-2 sm:p-3">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                StackIt AI
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
              </h3>
              <p className="text-purple-100 text-xs sm:text-sm">
                Powered by Google Gemini
              </p>
            </div>
          </div>
          
          {aiAnswer && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {Math.round(aiAnswer.confidence * 100)}% Confidence
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-purple-100 text-xs hidden sm:inline">AI Active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Answer Content */}
      <div className="bg-white border-l-4 border-r-4 border-purple-200 shadow-glow">
        {!showAnswer && !isLoading && (
          <div className="p-4 sm:p-6 lg:p-8 text-center">
            <div className="mb-4 sm:mb-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600" />
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2">
                Get an AI-Powered Answer
              </h4>
              <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                Let our AI analyze your question and provide a comprehensive answer instantly.
              </p>
            </div>
            
            <button
              onClick={generateAnswer}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="h-4 w-4" />
              <span className="text-sm sm:text-base">Generate AI Answer</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="p-4 sm:p-6 lg:p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 border-4 border-purple-300 border-t-purple-600"></div>
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              StackIt AI is analyzing your question...
            </p>
            <div className="mt-3 sm:mt-4 max-w-md mx-auto">
              <div className="bg-purple-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg m-4 sm:m-6">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="font-medium text-sm sm:text-base">Error:</span>
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}

        {showAnswer && aiAnswer && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Generated {new Date(aiAnswer.generatedAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={copyAnswer}
                className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Answer Content with Show More Feature */}
            <div className="relative">
              <div className={`overflow-hidden transition-all duration-300 ${shouldShowExpand ? 'max-h-40 sm:max-h-48 lg:max-h-56' : 'max-h-none'}`}>
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 sm:mb-3 text-sm sm:text-base text-gray-800">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 sm:pl-5 mb-2 sm:mb-3 text-sm sm:text-base text-gray-800">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 sm:pl-5 mb-2 sm:mb-3 text-sm sm:text-base text-gray-800">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      code: ({ inline, children }) => 
                        inline ? (
                          <code className="bg-gray-100 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-mono text-purple-700">{children}</code>
                        ) : (
                          <div className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg my-2 sm:my-3 overflow-x-auto">
                            <pre className="text-xs sm:text-sm font-mono">{children}</pre>
                          </div>
                        ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-purple-200 pl-3 sm:pl-4 italic text-gray-700 my-2 sm:my-3">
                          {children}
                        </blockquote>
                      ),
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                    }}
                  >
                    {aiAnswer.answer}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Fade overlay for long answers */}
              {shouldShowExpand && (
                <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>
            
            {/* Show More/Less Button */}
            {isLongAnswer && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors text-sm sm:text-base font-medium hover:bg-purple-50 px-3 py-1 rounded-full"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show More</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Voting Section */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-600">Was this answer helpful?</span>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button
                    onClick={() => handleVote('helpful')}
                    className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full transition-all ${
                      userVote === 'helpful'
                        ? 'bg-green-100 text-green-700'
                        : 'hover:bg-green-50 text-gray-600'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{votes.helpful}</span>
                  </button>
                  <button
                    onClick={() => handleVote('unhelpful')}
                    className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full transition-all ${
                      userVote === 'unhelpful'
                        ? 'bg-red-100 text-red-700'
                        : 'hover:bg-red-50 text-gray-600'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{votes.unhelpful}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient border */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-b-2xl"></div>
    </div>
  );
};

export default AIAnswer;
