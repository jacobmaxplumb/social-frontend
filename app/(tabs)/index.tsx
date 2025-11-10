import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { ApiListResponse, Comment, Post } from '../../types/api';

type LikeResponse = {
  liked: boolean;
  likes: number;
};

const DEFAULT_PROFILE_IMAGE = '👤';

const formatRelativeTime = (timestamp: string | undefined) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${Math.max(diffSeconds, 1)}s ago`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
};

const getDisplayTimestamp = (absolute: string, relative?: string) => {
  return relative || formatRelativeTime(absolute) || absolute;
};

export default function FeedScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [newPostText, setNewPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postLikeLoading, setPostLikeLoading] = useState<Set<string>>(new Set());
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [commentLikeLoading, setCommentLikeLoading] = useState<Set<string>>(new Set());

  const currentUserProfile = useMemo(() => {
    if (currentUser?.username) {
      const firstCharacter = currentUser.username.trim()[0];
      if (firstCharacter) {
        return firstCharacter.toUpperCase();
      }
    }
    return DEFAULT_PROFILE_IMAGE;
  }, [currentUser]);

  const fetchPosts = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await api.get<ApiListResponse<Post>>('/posts', {
          params: {
            limit: 20,
            offset: 0,
          },
        });

        setPosts(response.data.data);
      } catch (fetchError) {
        setError('Failed to load posts. Pull to refresh to try again.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(true);
    setRefreshing(false);
  }, [fetchPosts]);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleLike = async (postId: string) => {
    if (postLikeLoading.has(postId)) {
      return;
    }

    setPostLikeLoading((prev) => new Set(prev).add(postId));

    try {
      const response = await api.post<LikeResponse>(`/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: response.data.likes,
                likedByCurrentUser: response.data.liked,
              }
            : post,
        ),
      );
    } catch (likeError) {
      setError('Unable to update like. Please try again.');
    } finally {
      setPostLikeLoading((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleCreatePost = async () => {
    const text = newPostText.trim();
    if (!text || postSubmitting) {
      return;
    }

    setPostSubmitting(true);
    setError(null);

    try {
      const response = await api.post<Post>('/posts', { text });
      setPosts((prev) => [response.data, ...prev]);
      setNewPostText('');
      setIsCreatingPost(false);
    } catch (createError) {
      setError('Unable to create post. Please try again.');
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    const loadingKey = `${postId}:${commentId}`;
    if (commentLikeLoading.has(loadingKey)) {
      return;
    }

    setCommentLikeLoading((prev) => new Set(prev).add(loadingKey));

    try {
      const response = await api.post<LikeResponse>(`/posts/${postId}/comments/${commentId}/like`);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const updatedComments = post.comments?.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: response.data.likes,
                  likedByCurrentUser: response.data.liked,
                }
              : comment,
          );

          return {
            ...post,
            comments: updatedComments,
          };
        }),
      );
    } catch (likeError) {
      setError('Unable to update comment like. Please try again.');
    } finally {
      setCommentLikeLoading((prev) => {
        const next = new Set(prev);
        next.delete(loadingKey);
        return next;
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) {
      return;
    }

    setCommentSubmitting((prev) => ({
      ...prev,
      [postId]: true,
    }));

    try {
      const response = await api.post<Comment>(`/posts/${postId}/comments`, { text });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments ?? []), response.data],
              }
            : post,
        ),
      );

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: '',
      }));

      setExpandedComments((prev) => new Set(prev).add(postId));
    } catch (commentError) {
      setError('Unable to add comment. Please try again.');
    } finally {
      setCommentSubmitting((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  };

  const renderComment = (comment: Comment, postId: string) => {
    const likeCount = comment.likes || 0;
    const isLiked = Boolean(comment.likedByCurrentUser);
    const loadingKey = `${postId}:${comment.id}`;
    const isProcessing = commentLikeLoading.has(loadingKey);

    return (
      <View key={comment.id} style={styles.commentItem}>
        <View style={styles.commentProfileImageContainer}>
          <Text style={styles.commentProfileImage}>{comment.profileImage || DEFAULT_PROFILE_IMAGE}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentUsername}>{comment.username}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
          </View>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTimestamp}>
              {getDisplayTimestamp(comment.timestamp, comment.relativeTimestamp)}
            </Text>
            <TouchableOpacity
              style={styles.commentLikeButton}
              onPress={() => handleLikeComment(postId, comment.id)}
              disabled={isProcessing}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={14}
                color={isLiked ? '#FF3B30' : '#999'}
              />
              {likeCount > 0 && (
                <Text
                  style={[
                    styles.commentLikeCount,
                    isLiked && styles.commentLikeCountLiked,
                  ]}
                >
                  {likeCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderPost = (post: Post) => {
    const isCommentsExpanded = expandedComments.has(post.id);
    const commentCount = post.comments?.length || 0;
    const commentInput = commentInputs[post.id] || '';
    const isLiked = Boolean(post.likedByCurrentUser);
    const likeCount = post.likes || 0;
    const isLikeLoading = postLikeLoading.has(post.id);
    const isCommentSubmitting = commentSubmitting[post.id];

    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImage}>{post.profileImage || DEFAULT_PROFILE_IMAGE}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>
              {getDisplayTimestamp(post.timestamp, post.relativeTimestamp)}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postText}>{post.text}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
            disabled={isLikeLoading}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#FF3B30' : '#666'}
            />
            <Text style={[styles.actionText, isLiked && styles.likedActionText]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleComments(post.id)}
          >
            <Ionicons
              name={isCommentsExpanded ? 'chatbubble' : 'chatbubble-outline'}
              size={20}
              color={isCommentsExpanded ? '#007AFF' : '#666'}
            />
            <Text style={[styles.actionText, isCommentsExpanded && styles.activeActionText]}>
              {commentCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {isCommentsExpanded && (
          <View style={styles.commentsSection}>
            {commentCount > 0 && (
              <View style={styles.commentsList}>
                {post.comments?.map((comment) => renderComment(comment, post.id))}
              </View>
            )}

            <View style={styles.addCommentContainer}>
              <View style={styles.addCommentProfileImageContainer}>
                <Text style={styles.addCommentProfileImage}>{currentUserProfile}</Text>
              </View>
              <View style={styles.addCommentInputContainer}>
                <TextInput
                  style={styles.addCommentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#999"
                  value={commentInput}
                  onChangeText={(text) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post.id]: text,
                    }))
                  }
                  multiline
                  maxLength={500}
                />
                {commentInput.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleAddComment(post.id)}
                    disabled={isCommentSubmitting}
                  >
                    <Ionicons name="send" size={18} color={isCommentSubmitting ? '#999' : '#007AFF'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      >
        <View style={styles.createPostCard}>
          <View style={styles.createPostHeader}>
            <View style={styles.createPostProfileImageContainer}>
              <Text style={styles.createPostProfileImage}>{currentUserProfile}</Text>
            </View>
            <View style={styles.createPostInputContainer}>
              <TextInput
                style={styles.createPostInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                value={newPostText}
                onChangeText={setNewPostText}
                multiline
                maxLength={1000}
                onFocus={() => setIsCreatingPost(true)}
              />
            </View>
          </View>
          {(isCreatingPost || newPostText.trim().length > 0) && (
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={styles.cancelPostButton}
                onPress={() => {
                  setNewPostText('');
                  setIsCreatingPost(false);
                }}
              >
                <Text style={styles.cancelPostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (newPostText.trim().length === 0 || postSubmitting) && styles.postButtonDisabled,
                ]}
                onPress={handleCreatePost}
                disabled={newPostText.trim().length === 0 || postSubmitting}
              >
                <Text
                  style={[
                    styles.postButtonText,
                    (newPostText.trim().length === 0 || postSubmitting) && styles.postButtonTextDisabled,
                  ]}
                >
                  {postSubmitting ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          posts.map(renderPost)
        )}

        {!loading && posts.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No posts yet. Start the conversation!</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileImage: {
    fontSize: 24,
  },
  postHeaderInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 4,
  },
  postText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeActionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  likedActionText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentProfileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentProfileImage: {
    fontSize: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  commentLikeCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  commentLikeCountLiked: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addCommentProfileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addCommentProfileImage: {
    fontSize: 16,
  },
  addCommentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addCommentInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
  createPostCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  createPostProfileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createPostProfileImage: {
    fontSize: 24,
  },
  createPostInputContainer: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  createPostInput: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
    paddingVertical: 8,
    maxHeight: 150,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelPostButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelPostText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  postButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffd6d6',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

