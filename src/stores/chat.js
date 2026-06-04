import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();

  // Global chat state
  const globalMessages = ref([]);
  const globalLoading = ref(false);
  const globalPage = ref(0);
  const globalHasMore = ref(true);
  const globalUnreadCount = ref(0);

  // DM chat state
  const directMessages = ref({});
  const dmLoading = ref(false);
  const dmUnreadCounts = ref({});
  const selectedDmPartnerId = ref(null);

  // Room chat state
  const roomMessages = ref({});

  // Typing indicators
  const typingUsers = ref({});

  // Subscriptions
  const subscriptions = ref({});

  const MESSAGES_PER_PAGE = 20;

  // Computed properties
  const globalUnread = computed(() => globalUnreadCount.value);
  const dmTotalUnread = computed(() =>
    Object.values(dmUnreadCounts.value).reduce((a, b) => a + b, 0)
  );

  // Initialize subscriptions
  const initializeSubscriptions = async () => {
    if (!authStore.user) return;

    // Subscribe to global messages
    const globalSub = supabase
      .channel('global_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_messages' },
        (payload) => {
          globalMessages.value.push(payload.new);
        }
      )
      .subscribe();

    subscriptions.value.global = globalSub;

    // Subscribe to direct messages for current user
    const dmSub = supabase
      .channel('direct_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const { sender_id, recipient_id } = payload.new;
          const partnerId = sender_id === authStore.user.id ? recipient_id : sender_id;

          if (!directMessages.value[partnerId]) {
            directMessages.value[partnerId] = [];
          }
          directMessages.value[partnerId].push(payload.new);

          // Update unread if message is from other user
          if (sender_id !== authStore.user.id) {
            dmUnreadCounts.value[partnerId] = (dmUnreadCounts.value[partnerId] || 0) + 1;
          }
        }
      )
      .subscribe();

    subscriptions.value.dm = dmSub;
  };

  // Cleanup subscriptions
  const cleanupSubscriptions = async () => {
    for (const [key, sub] of Object.entries(subscriptions.value)) {
      await supabase.removeChannel(sub);
    }
    subscriptions.value = {};
  };

  // Global Messages
  const fetchGlobalMessages = async (page = 0) => {
    globalLoading.value = true;
    try {
      const from = page * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('global_messages')
        .select('*, users(id, display_name, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (page === 0) {
        globalMessages.value = data.reverse();
      } else {
        globalMessages.value = [...data.reverse(), ...globalMessages.value];
      }

      globalPage.value = page;
      globalHasMore.value = globalMessages.value.length < (count || 0);
    } catch (error) {
      console.error('Error fetching global messages:', error);
    } finally {
      globalLoading.value = false;
    }
  };

  const sendGlobalMessage = async (text) => {
    if (!authStore.user || !text.trim()) return;

    try {
      const { error } = await supabase
        .from('global_messages')
        .insert([{
          user_id: authStore.user.id,
          content: text,
          type: 'text'
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending global message:', error);
      throw error;
    }
  };

  // Direct Messages
  const fetchDMMessages = async (partnerId, page = 0) => {
    dmLoading.value = true;
    try {
      const from = page * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*, sender:sender_id(id, display_name, avatar_url), recipient:recipient_id(id, display_name, avatar_url)')
        .or(`and(sender_id.eq.${authStore.user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${authStore.user.id})`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (page === 0) {
        directMessages.value[partnerId] = data.reverse();
      } else {
        directMessages.value[partnerId] = [...data.reverse(), ...(directMessages.value[partnerId] || [])];
      }

      // Mark as read
      if (page === 0) {
        await markAsRead(`dm:${partnerId}`);
      }
    } catch (error) {
      console.error('Error fetching DM messages:', error);
    } finally {
      dmLoading.value = false;
    }
  };

  const sendDM = async (recipientId, text, type = 'text') => {
    if (!authStore.user || !text.trim()) return;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert([{
          sender_id: authStore.user.id,
          recipient_id: recipientId,
          content: text,
          type
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending DM:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = async (chatId) => {
    if (!authStore.user) return;

    try {
      if (chatId.startsWith('dm:')) {
        const partnerId = chatId.split(':')[1];

        await supabase
          .from('direct_messages')
          .update({ read: true })
          .eq('recipient_id', authStore.user.id)
          .eq('sender_id', partnerId);

        dmUnreadCounts.value[partnerId] = 0;
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Room Messages (in-memory only)
  const addRoomMessage = (roomId, message) => {
    if (!roomMessages.value[roomId]) {
      roomMessages.value[roomId] = [];
    }
    roomMessages.value[roomId].push(message);
  };

  const getRoomMessages = (roomId) => {
    return roomMessages.value[roomId] || [];
  };

  const clearRoomMessages = (roomId) => {
    delete roomMessages.value[roomId];
  };

  // Typing indicators
  const setTyping = (userId, displayName, chatType, chatId) => {
    const key = `${chatType}:${chatId}:${userId}`;
    typingUsers.value[key] = displayName;

    setTimeout(() => {
      delete typingUsers.value[key];
    }, 3000);
  };

  const getTypingUsers = (chatType, chatId) => {
    const prefix = `${chatType}:${chatId}:`;
    return Object.entries(typingUsers.value)
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, name]) => name);
  };

  return {
    // Global state
    globalMessages,
    globalLoading,
    globalPage,
    globalHasMore,
    globalUnreadCount,
    globalUnread,

    // DM state
    directMessages,
    dmLoading,
    dmUnreadCounts,
    selectedDmPartnerId,
    dmTotalUnread,

    // Room state
    roomMessages,

    // Typing
    typingUsers,

    // Methods
    initializeSubscriptions,
    cleanupSubscriptions,
    fetchGlobalMessages,
    sendGlobalMessage,
    fetchDMMessages,
    sendDM,
    markAsRead,
    addRoomMessage,
    getRoomMessages,
    clearRoomMessages,
    setTyping,
    getTypingUsers
  };
});
