import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Comment, mockPosts, Post } from '../../data/mockPosts';

const CURRENT_USER = 'you'; // Mock current user

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
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

  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentProfileImageContainer}>
        <Text style={styles.commentProfileImage}>{comment.profileImage}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
        <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
      </View>
    </View>
  );

  const renderPost = (post: Post) => {
    const isCommentsExpanded = expandedComments.has(post.id);
    const commentCount = post.comments?.length || 0;
    const commentInput = commentInputs[post.id] || '';

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
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{post.likes || 0}</Text>
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
                {post.comments?.map(renderComment)}
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
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
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
});

