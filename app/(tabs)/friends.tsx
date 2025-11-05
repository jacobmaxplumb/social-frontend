import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Friend, FriendSuggestion, PendingRequest, mockCurrentFriends, mockFriendSuggestions, mockPendingRequests } from '../../data/mockFriends';

type TabType = 'current' | 'suggested' | 'pending';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [friends, setFriends] = useState<Friend[]>(mockCurrentFriends);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>(mockFriendSuggestions);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(mockPendingRequests);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddFriend = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      // Move to pending requests (outgoing)
      const newPendingRequest: PendingRequest = {
        id: suggestion.id,
        username: suggestion.username,
        profileImage: suggestion.profileImage,
        type: 'outgoing',
        mutualFriends: suggestion.mutualFriends,
        sentAt: 'Just now',
      };
      setPendingRequests([...pendingRequests, newPendingRequest]);
      // Remove from suggestions
      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId && r.type === 'incoming');
    if (request) {
      // Add to friends list
      const newFriend: Friend = {
        id: request.id,
        username: request.username,
        profileImage: request.profileImage,
        status: 'offline',
        mutualFriends: request.mutualFriends,
      };
      setFriends([...friends, newFriend]);
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    // Remove from pending requests
    setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
  };

  const handleCancelRequest = (requestId: string) => {
    // Remove from pending requests
    setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
  };

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return friends;
    }
    const query = searchQuery.toLowerCase();
    return friends.filter(friend => 
      friend.username.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  // Filter suggestions based on search query
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return suggestions;
    }
    const query = searchQuery.toLowerCase();
    return suggestions.filter(suggestion => 
      suggestion.username.toLowerCase().includes(query)
    );
  }, [suggestions, searchQuery]);

  // Filter pending requests based on search query
  const filteredPendingRequests = useMemo(() => {
    if (!searchQuery.trim()) {
      return pendingRequests;
    }
    const query = searchQuery.toLowerCase();
    return pendingRequests.filter(request => 
      request.username.toLowerCase().includes(query)
    );
  }, [pendingRequests, searchQuery]);

  // Separate incoming and outgoing requests
  const incomingRequests = useMemo(() => 
    filteredPendingRequests.filter(r => r.type === 'incoming'),
    [filteredPendingRequests]
  );
  
  const outgoingRequests = useMemo(() => 
    filteredPendingRequests.filter(r => r.type === 'outgoing'),
    [filteredPendingRequests]
  );

  const renderFriend = (friend: Friend) => (
    <View key={friend.id} style={styles.friendCard}>
      <View style={styles.friendHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImage}>{friend.profileImage}</Text>
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

  const renderSuggestion = (suggestion: FriendSuggestion) => (
    <View key={suggestion.id} style={styles.suggestionCard}>
      <View style={styles.friendHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImage}>{suggestion.profileImage}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.username}>{suggestion.username}</Text>
          <Text style={styles.mutualFriends}>
            {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddFriend(suggestion.id)}
      >
        <Ionicons name="person-add-outline" size={18} color="#fff" />
        <Text style={styles.addButtonText}> Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPendingRequest = (request: PendingRequest) => (
    <View key={request.id} style={styles.pendingCard}>
      <View style={styles.friendHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImage}>{request.profileImage}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.username}>{request.username}</Text>
          {request.mutualFriends !== undefined && (
            <Text style={styles.mutualFriends}>
              {request.mutualFriends} mutual {request.mutualFriends === 1 ? 'friend' : 'friends'}
            </Text>
          )}
          {request.sentAt && (
            <Text style={styles.requestTime}>{request.sentAt}</Text>
          )}
        </View>
      </View>
      {request.type === 'incoming' ? (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDeclineRequest(request.id)}
          >
            <Ionicons name="close" size={18} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptButton, { marginLeft: 8 }]}
            onPress={() => handleAcceptRequest(request.id)}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.acceptButtonText}> Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.requestActions}>
          <Text style={styles.pendingText}>Pending</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(request.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
          {activeTab === 'current' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggested' && styles.activeTab]}
          onPress={() => setActiveTab('suggested')}
        >
          <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTabText]}>
            Suggested
          </Text>
          {activeTab === 'suggested' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
          {activeTab === 'pending' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab === 'current' ? 'friends' : activeTab === 'suggested' ? 'suggestions' : 'requests'}...`}
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

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'current' ? (
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
});

