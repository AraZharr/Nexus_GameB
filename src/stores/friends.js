import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';

export const useFriendsStore = defineStore('friends', () => {
  const authStore = useAuthStore();

  // State
  const friends = ref([]);
  const friendRequests = ref([]);
  const blockedUsers = ref([]);
  const searchResults = ref([]);
  const loading = ref(false);
  const onlineUsers = ref(new Set());

  const FRIEND_LIMIT = 100;

  // Computed properties
  const friendCount = computed(() => friends.value.length);
  const friendIds = computed(() => friends.value.map(f => f.id));
  const isFriendLimitReached = computed(() => friendCount.value >= FRIEND_LIMIT);
  const friendLimitWarning = computed(() => friendCount.value >= 90);
  const pendingRequestCount = computed(() => friendRequests.value.length);

  // Subscribe to online presence
  const subscribeToPresence = async () => {
    if (!authStore.user) return;

    const presenceSub = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceSub.presenceState();
        onlineUsers.value = new Set(Object.keys(state));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        onlineUsers.value.add(key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        onlineUsers.value.delete(key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceSub.track({
            user_id: authStore.user.id,
            online_at: new Date()
          });
        }
      });

    return presenceSub;
  };

  // Fetch friends list
  const fetchFriends = async () => {
    if (!authStore.user) return;

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('friend:friend_id(id, display_name, avatar_url)')
        .eq('user_id', authStore.user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      friends.value = (data || []).map(f => ({
        id: f.friend.id,
        display_name: f.friend.display_name,
        avatar_url: f.friend.avatar_url,
        online: false
      }));
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      loading.value = false;
    }
  };

  // Fetch friend requests
  const fetchRequests = async () => {
    if (!authStore.user) return;

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id, requester:user_id(id, display_name, avatar_url)')
        .eq('friend_id', authStore.user.id)
        .eq('status', 'pending');

      if (error) throw error;

      friendRequests.value = (data || []).map(r => ({
        requestId: r.id,
        userId: r.requester.id,
        display_name: r.requester.display_name,
        avatar_url: r.requester.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      loading.value = false;
    }
  };

  // Search users by display_name
  const searchUsers = async (query) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .neq('id', authStore.user.id)
        .limit(20);

      if (error) throw error;

      searchResults.value = (data || []).map(user => {
        const isFriend = friendIds.value.includes(user.id);
        const isBlocked = blockedUsers.value.some(b => b.id === user.id);
        const hasRequest = friendRequests.value.some(r => r.userId === user.id);

        return {
          ...user,
          isFriend,
          isBlocked,
          hasRequest,
          online: onlineUsers.value.has(user.id)
        };
      });
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      loading.value = false;
    }
  };

  // Send friend request
  const sendRequest = async (userId) => {
    if (!authStore.user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert([{
          user_id: authStore.user.id,
          friend_id: userId,
          status: 'pending'
        }]);

      if (error) throw error;

      // Update search results
      const result = searchResults.value.find(r => r.id === userId);
      if (result) {
        result.hasRequest = true;
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  // Accept friend request
  const acceptRequest = async (requestId) => {
    try {
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Also create reverse friendship
      const request = friendRequests.value.find(r => r.requestId === requestId);
      if (request) {
        const { error: insertError } = await supabase
          .from('friendships')
          .insert([{
            user_id: authStore.user.id,
            friend_id: request.userId,
            status: 'accepted'
          }]);

        if (insertError) throw insertError;

        // Update local state
        friends.value.push({
          id: request.userId,
          display_name: request.display_name,
          avatar_url: request.avatar_url,
          online: onlineUsers.value.has(request.userId)
        });

        friendRequests.value = friendRequests.value.filter(r => r.requestId !== requestId);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  // Decline friend request
  const declineRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      friendRequests.value = friendRequests.value.filter(r => r.requestId !== requestId);
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  };

  // Remove friend
  const removeFriend = async (friendId) => {
    if (!authStore.user) return;

    try {
      // Delete both directions
      const { error: error1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('friend_id', friendId);

      const { error: error2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', authStore.user.id);

      if (error1 || error2) throw error1 || error2;

      friends.value = friends.value.filter(f => f.id !== friendId);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  // Block user
  const blockUser = async (userId) => {
    if (!authStore.user) return;

    try {
      // Create block record
      const { error: blockError } = await supabase
        .from('blocks')
        .insert([{
          user_id: authStore.user.id,
          blocked_user_id: userId
        }]);

      if (blockError && blockError.code !== 'PGRST116') throw blockError;

      // Remove friendship if exists
      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('friend_id', userId);

      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', authStore.user.id);

      // Update local state
      friends.value = friends.value.filter(f => f.id !== userId);

      if (!blockedUsers.value.find(b => b.id === userId)) {
        blockedUsers.value.push({ id: userId });
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  // Unblock user
  const unblockUser = async (userId) => {
    if (!authStore.user) return;

    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('blocked_user_id', userId);

      if (error) throw error;

      blockedUsers.value = blockedUsers.value.filter(b => b.id !== userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  // Get friend by ID
  const getFriend = (friendId) => {
    return friends.value.find(f => f.id === friendId);
  };

  // Check if user is friend
  const isFriend = (userId) => {
    return friendIds.value.includes(userId);
  };

  // Check if user is blocked
  const isBlocked = (userId) => {
    return blockedUsers.value.some(b => b.id === userId);
  };

  return {
    // State
    friends,
    friendRequests,
    blockedUsers,
    searchResults,
    loading,
    onlineUsers,

    // Computed
    friendCount,
    friendIds,
    isFriendLimitReached,
    friendLimitWarning,
    pendingRequestCount,

    // Methods
    subscribeToPresence,
    fetchFriends,
    fetchRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    blockUser,
    unblockUser,
    getFriend,
    isFriend,
    isBlocked
  };
});
