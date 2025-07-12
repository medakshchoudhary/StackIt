import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ChevronUp, ChevronDown, Edit, Trash2, Reply, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { commentsAPI } from '../services/commentsAPI';
import { timeAgo } from '../utils/helpers';

const CommentCard = ({ comment, onReply, onEdit, onDelete, onVote, depth = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [voteCount, setVoteCount] = useState(comment.voteCount || 0);
  const [userVote, setUserVote] = useState(null);
  const [voting, setVoting] = useState(false);

  const isAuthor = user?._id === comment.author?._id;
  const maxDepth = 3;

  useEffect(() => {
    // Check if current user has voted on this comment
    const currentUserVote = comment.votes?.find(vote => vote.user === user?._id);
    setUserVote(currentUserVote?.value || null);
  }, [comment.votes, user?._id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await onReply(comment._id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      await onEdit(comment._id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleVote = async (value) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    if (voting) return;
    
    setVoting(true);
    try {
      const response = await commentsAPI.voteComment(comment._id, value);
      setVoteCount(response.data.voteCount);
      setUserVote(response.data.userVote);
      onVote && onVote(comment._id, response.data);
    } catch (error) {
      console.error('Error voting on comment:', error);
    } finally {
      setVoting(false);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className={`${depth > 0 ? `comment-thread comment-thread-${Math.min(depth, 3)}` : ''} py-2`}>
        <div className="text-gray-500 italic text-sm">
          [This comment has been deleted]
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentCard
                key={reply._id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onVote={onVote}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? `comment-thread comment-thread-${Math.min(depth, 3)}` : ''} py-2`}>
      <div className="flex items-start space-x-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={() => handleVote(1)}
            disabled={voting}
            className={`p-1 rounded transition-colors ${
              userVote === 1
                ? 'bg-green-100 text-green-600'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upvote"
          >
            <ChevronUp size={16} />
          </button>
          
          <span className={`text-xs font-medium ${
            voteCount > 0 ? 'text-green-600' : 
            voteCount < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {voteCount}
          </span>
          
          <button
            onClick={() => handleVote(-1)}
            disabled={voting}
            className={`p-1 rounded transition-colors ${
              userVote === -1
                ? 'bg-red-100 text-red-600'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Downvote"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-700 text-sm">
              {comment.author?.username || 'Anonymous'}
            </span>
            <span className="text-gray-500 text-xs">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleEdit} className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Edit your comment..."
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {isAuthenticated && depth < maxDepth && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <Reply size={12} />
                <span>Reply</span>
              </button>
            )}
            
            {isAuthor && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="flex items-center space-x-1 hover:text-red-600"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                {showReplies ? <Minus size={12} /> : <Plus size={12} />}
                <span>
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                </span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleReply} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Write a reply..."
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map(reply => (
                <CommentCard
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onVote={onVote}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentsSection = ({ answerId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getComments(answerId);
      setComments(response.data || []);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [answerId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentsAPI.createComment(answerId, newComment);
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    const response = await commentsAPI.createComment(answerId, content, parentCommentId);
    // Refresh comments to show new reply
    fetchComments();
    return response.data;
  };

  const handleEdit = async (commentId, content) => {
    const response = await commentsAPI.updateComment(commentId, content);
    // Update comment in state
    setComments(comments.map(comment => 
      comment._id === commentId ? { ...comment, content } : comment
    ));
    return response.data;
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.deleteComment(commentId);
        // Refresh comments to show updated state
        fetchComments();
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    }
  };

  const handleVote = (commentId, voteData) => {
    // Update vote count in state
    setComments(comments.map(comment =>
      comment._id === commentId 
        ? { ...comment, voteCount: voteData.voteCount }
        : comment
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <MessageSquare size={16} />
          <span>
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown 
            size={16} 
            className={`transform transition-transform ${showComments ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showComments && (
        <div className="space-y-4">
          {/* New Comment Form */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitComment} className="bg-gray-50 p-4 rounded-lg">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a comment..."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onVote={handleVote}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
