import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Comment, mockPosts, Post } from '../../data/mockPosts';

const CURRENT_USER = 'you'; // Mock current user
const CURRENT_USER_PROFILE = '👤'; // Mock current user profile image

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [newPostText, setNewPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentLikes = post.likes || 0;
        return {
          ...post,
          likes: isLiked ? currentLikes - 1 : currentLikes + 1,
        };
      }
      return post;
    }));

    // Toggle liked state
    const newLikedPosts = new Set(likedPosts);
    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleCreatePost = () => {
    const postText = newPostText.trim();
    if (!postText) return;

    const newPost: Post = {
      id: `p${Date.now()}`,
      username: CURRENT_USER,
      profileImage: CURRENT_USER_PROFILE,
      timestamp: 'Just now',
      text: postText,
      likes: 0,
      comments: [],
    };

    // Add new post at the beginning of the array
    setPosts([newPost, ...posts]);
    
    // Clear input and close
    setNewPostText('');
    setIsCreatingPost(false);
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    const isLiked = likedComments.has(commentId);
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments?.map(comment => {
          if (comment.id === commentId) {
            const currentLikes = comment.likes || 0;
            return {
              ...comment,
              likes: isLiked ? currentLikes - 1 : currentLikes + 1,
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    }));

    // Toggle liked state
    const newLikedComments = new Set(likedComments);
    if (isLiked) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
  };

  const handleAddComment = (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      username: CURRENT_USER,
      profileImage: '👤',
      text: commentText,
      timestamp: 'Just now',
      likes: 0,
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...(post.comments || []), newComment] }
        : post
    ));

    // Clear input
    setCommentInputs({ ...commentInputs, [postId]: '' });
    
    // Expand comments if not already expanded
    if (!expandedComments.has(postId)) {
      setExpandedComments(new Set([...expandedComments, postId]));
    }
  };

  const renderComment = (comment: Comment, postId: string) => {
    const isLiked = likedComments.has(comment.id);
    const likeCount = comment.likes || 0;

    return (
      <View key={comment.id} style={styles.commentItem}>
        <View style={styles.commentProfileImageContainer}>
          <Text style={styles.commentProfileImage}>{comment.profileImage}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentUsername}>{comment.username}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
          </View>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
            <TouchableOpacity
              style={styles.commentLikeButton}
              onPress={() => handleLikeComment(postId, comment.id)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={14}
                color={isLiked ? "#FF3B30" : "#999"}
              />
              {likeCount > 0 && (
                <Text style={[
                  styles.commentLikeCount,
                  isLiked && styles.commentLikeCountLiked,
                ]}>
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
    const isLiked = likedPosts.has(post.id);
    const likeCount = post.likes || 0;

    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImage}>{post.profileImage}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
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
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? "#FF3B30" : "#666"} 
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
              name={isCommentsExpanded ? "chatbubble" : "chatbubble-outline"} 
              size={20} 
              color={isCommentsExpanded ? "#007AFF" : "#666"} 
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

        {/* Comments Section */}
        {isCommentsExpanded && (
          <View style={styles.commentsSection}>
            {commentCount > 0 && (
              <View style={styles.commentsList}>
                {post.comments?.map(comment => renderComment(comment, post.id))}
              </View>
            )}
            
            {/* Add Comment Input */}
            <View style={styles.addCommentContainer}>
              <View style={styles.addCommentProfileImageContainer}>
                <Text style={styles.addCommentProfileImage}>👤</Text>
              </View>
              <View style={styles.addCommentInputContainer}>
                <TextInput
                  style={styles.addCommentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#999"
                  value={commentInput}
                  onChangeText={(text) => setCommentInputs({ ...commentInputs, [post.id]: text })}
                  multiline
                  maxLength={500}
                />
                {commentInput.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleAddComment(post.id)}
                  >
                    <Ionicons name="send" size={18} color="#007AFF" />
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
      >
        {/* Create Post Section */}
        <View style={styles.createPostCard}>
          <View style={styles.createPostHeader}>
            <View style={styles.createPostProfileImageContainer}>
              <Text style={styles.createPostProfileImage}>{CURRENT_USER_PROFILE}</Text>
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
                  newPostText.trim().length === 0 && styles.postButtonDisabled,
                ]}
                onPress={handleCreatePost}
                disabled={newPostText.trim().length === 0}
              >
                <Text style={[
                  styles.postButtonText,
                  newPostText.trim().length === 0 && styles.postButtonTextDisabled,
                ]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {posts.map(renderPost)}
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
});

