import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { api } from '../../lib/api';
import type { ApiListResponse, Friend, FriendSuggestion, PendingRequest } from '../../types/api';

type TabType = 'current' | 'suggested' | 'pending';

const DEFAULT_PROFILE_IMAGE = '👤';

const getTimestamp = (sentAt: string, relative?: string) => {
  if (relative) {
    return relative;
  }
  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) {
    return sentAt;
  }
  return date.toLocaleString();
};

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addFriendLoading, setAddFriendLoading] = useState<Set<string>>(new Set());

  const fetchFriends = useCallback(async () => {
    const response = await api.get<ApiListResponse<Friend>>('/friends', {
      params: { limit: 50, offset: 0 },
    });
    setFriends(response.data.data);
  }, []);

  const fetchSuggestions = useCallback(async () => {
    const response = await api.get<ApiListResponse<FriendSuggestion>>('/friends/suggestions', {
      params: { limit: 50, offset: 0 },
    });
    setSuggestions(response.data.data);
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    const response = await api.get<ApiListResponse<PendingRequest>>('/friends/requests', {
      params: { limit: 50, offset: 0 },
    });
    setPendingRequests(response.data.data);
  }, []);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        await Promise.all([fetchFriends(), fetchSuggestions(), fetchPendingRequests()]);
      } catch (fetchError) {
        setError('Unable to load friends. Pull to refresh to try again.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [fetchFriends, fetchPendingRequests, fetchSuggestions],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll(true);
    setRefreshing(false);
  }, [fetchAll]);

  const handleAddFriend = async (suggestionId: string) => {
    if (addFriendLoading.has(suggestionId)) {
      return;
    }

    const suggestion = suggestions.find((item) => item.id === suggestionId);
    if (!suggestion) {
      return;
    }

    setAddFriendLoading((prev) => new Set(prev).add(suggestionId));
    setError(null);

    try {
      await api.post('/friends/request', { username: suggestion.username });
      await Promise.all([fetchSuggestions(), fetchPendingRequests()]);
    } catch (addError) {
      setError('Unable to send friend request. Please try again.');
    } finally {
      setAddFriendLoading((prev) => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }
  };

  const showUnavailableAction = () => {
    Alert.alert(
      'Action not available',
      'Accepting or declining requests requires backend support that is not yet implemented.',
    );
  };

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return friends;
    }
    const query = searchQuery.toLowerCase();
    return friends.filter((friend) => friend.username.toLowerCase().includes(query));
  }, [friends, searchQuery]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return suggestions;
    }
    const query = searchQuery.toLowerCase();
    return suggestions.filter((suggestion) =>
      suggestion.username.toLowerCase().includes(query),
    );
  }, [suggestions, searchQuery]);

  const filteredPendingRequests = useMemo(() => {
    if (!searchQuery.trim()) {
      return pendingRequests;
    }
    const query = searchQuery.toLowerCase();
    return pendingRequests.filter((request) =>
      request.username.toLowerCase().includes(query),
    );
  }, [pendingRequests, searchQuery]);

  const incomingRequests = useMemo(
    () => filteredPendingRequests.filter((request) => request.type === 'incoming'),
    [filteredPendingRequests],
  );

  const outgoingRequests = useMemo(
    () => filteredPendingRequests.filter((request) => request.type === 'outgoing'),
    [filteredPendingRequests],
  );

  const renderFriend = (friend: Friend) => (
    <View key={friend.id} style={styles.friendCard}>
      <View style={styles.friendHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImage}>{friend.profileImage || DEFAULT_PROFILE_IMAGE}</Text>
          {friend.status === 'online' && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.username}>{friend.username}</Text>
          {friend.mutualFriends !== undefined && (
            <Text style={styles.mutualFriends}>
              {friend.mutualFriends} mutual {friend.mutualFriends === 1 ? 'friend' : 'friends'}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = (suggestion: FriendSuggestion) => {
    const isLoading = addFriendLoading.has(suggestion.id);
    return (
      <View key={suggestion.id} style={styles.suggestionCard}>
        <View style={styles.friendHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImage}>{suggestion.profileImage || DEFAULT_PROFILE_IMAGE}</Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.username}>{suggestion.username}</Text>
            <Text style={styles.mutualFriends}>
              {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={() => handleAddFriend(suggestion.id)}
          disabled={isLoading}
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.addButtonText}>{isLoading ? 'Sending...' : ' Add'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPendingRequest = (request: PendingRequest) => (
    <View key={request.id} style={styles.pendingCard}>
      <View style={styles.friendHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImage}>{request.profileImage || DEFAULT_PROFILE_IMAGE}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.username}>{request.username}</Text>
          {request.mutualFriends !== undefined && (
            <Text style={styles.mutualFriends}>
              {request.mutualFriends} mutual {request.mutualFriends === 1 ? 'friend' : 'friends'}
            </Text>
          )}
          {request.sentAt && (
            <Text style={styles.requestTime}>
              {getTimestamp(request.sentAt, request.relativeTimestamp)}
            </Text>
          )}
        </View>
      </View>
      {request.type === 'incoming' ? (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.declineButton} onPress={showUnavailableAction}>
            <Ionicons name="close" size={18} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptButton, { marginLeft: 8 }]}
            onPress={showUnavailableAction}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.acceptButtonText}> Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.requestActions}>
          <Text style={styles.pendingText}>Pending</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={showUnavailableAction}>
            <Ionicons name="close-circle-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Current</Text>
          {activeTab === 'current' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggested' && styles.activeTab]}
          onPress={() => setActiveTab('suggested')}
        >
          <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTabText]}>
            Suggested
          </Text>
          {activeTab === 'suggested' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
          {activeTab === 'pending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${
            activeTab === 'current' ? 'friends' : activeTab === 'suggested' ? 'suggestions' : 'requests'
          }...`}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchAll()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : activeTab === 'current' ? (
          <>
            {filteredFriends.length > 0 ? (
              filteredFriends.map(renderFriend)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </Text>
              </View>
            )}
          </>
        ) : activeTab === 'suggested' ? (
          <>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map(renderSuggestion)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No suggestions found' : 'No suggestions available'}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {filteredPendingRequests.length > 0 ? (
              <>
                {incomingRequests.length > 0 && (
                  <View style={styles.pendingSection}>
                    <Text style={styles.sectionTitle}>Incoming Requests</Text>
                    {incomingRequests.map(renderPendingRequest)}
                  </View>
                )}
                {outgoingRequests.length > 0 && (
                  <View style={styles.pendingSection}>
                    <Text style={styles.sectionTitle}>Outgoing Requests</Text>
                    {outgoingRequests.map(renderPendingRequest)}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No requests found' : 'No pending requests'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingSection: {
    marginBottom: 24,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  profileImage: {
    fontSize: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 13,
    color: '#999',
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 4,
  },
  pendingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#80bfff',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});

