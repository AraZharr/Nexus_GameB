<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <!-- Header -->
    <div class="bg-slate-900/50 border-b border-slate-700/30 backdrop-blur-md sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold">Chat</h1>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Tabs -->
      <div class="flex border-b border-slate-700/30">
        <button
          @click="activeTab = 'global'"
          :class="[
            'flex-1 px-4 py-3 font-semibold transition-colors',
            activeTab === 'global'
              ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          Global
        </button>
        <button
          @click="activeTab = 'friends'"
          :class="[
            'flex-1 px-4 py-3 font-semibold transition-colors relative',
            activeTab === 'friends'
              ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          Friends
          <span
            v-if="chatStore.dmTotalUnread > 0"
            class="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ chatStore.dmTotalUnread }}
          </span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-4 md:p-6">
        <!-- Global Chat Tab -->
        <div v-if="activeTab === 'global'" class="space-y-4">
          <!-- Messages List -->
          <div
            class="h-96 overflow-y-auto mb-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30 backdrop-blur-sm"
            ref="messagesContainer"
          >
            <div v-if="chatStore.globalLoading && chatStore.globalMessages.length === 0" class="text-center py-8">
              <p class="text-slate-400">Loading messages...</p>
            </div>

            <div v-else-if="chatStore.globalMessages.length === 0" class="text-center py-8">
              <p class="text-slate-400">No messages yet. Start the conversation!</p>
            </div>

            <div v-else class="space-y-2">
              <!-- Load more button -->
              <button
                v-if="chatStore.globalHasMore"
                @click="loadMoreGlobalMessages"
                class="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Load older messages
              </button>

              <!-- Messages -->
              <ChatBubble
                v-for="msg in chatStore.globalMessages"
                :key="msg.id"
                :message="msg"
                :currentUserId="authStore.user.id"
                :showSenderName="true"
                @report="reportMessage"
              />

              <!-- Typing indicators -->
              <div v-if="typingList.length > 0" class="text-sm text-slate-400 italic">
                {{ typingList.join(', ') }} {{ typingList.length === 1 ? 'is' : 'are' }} typing...
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="flex gap-2">
            <input
              v-model="messageInput"
              @keyup.enter="sendGlobalMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 px-4 py-3 bg-slate-800/60 text-slate-50 rounded-lg border border-slate-700/30 focus:border-blue-500 focus:outline-none transition-colors backdrop-blur-sm"
            />

            <!-- Emoji button -->
            <button
              @click="showEmojiPicker = !showEmojiPicker"
              class="px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/30 transition-colors"
              title="Emoji picker"
            >
              😊
            </button>

            <!-- Image button -->
            <button
              @click="$refs.imageInput.click()"
              class="px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/30 transition-colors"
              title="Send image"
            >
              🖼
            </button>

            <!-- Send button -->
            <button
              @click="sendGlobalMessage"
              :disabled="!messageInput.trim() || chatStore.globalLoading"
              class="px-6 py-3 bg-blue-600/60 hover:bg-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>

          <!-- Emoji Picker Popup -->
          <div v-if="showEmojiPicker" class="relative">
            <EmojiPicker @select="insertEmoji" />
          </div>
        </div>

        <!-- Friends DM Tab -->
        <div v-if="activeTab === 'friends'" class="space-y-4">
          <div v-if="!selectedDmPartnerId">
            <!-- DM List -->
            <div class="space-y-2">
              <div v-if="dmList.length === 0" class="text-center py-8">
                <p class="text-slate-400">No conversations yet. Find friends to chat!</p>
              </div>

              <div
                v-for="friend in dmList"
                :key="friend.id"
                @click="selectedDmPartnerId = friend.id"
                class="p-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-lg border border-slate-700/30 cursor-pointer transition-all backdrop-blur-sm"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="relative">
                    <img
                      v-if="friend.avatar_url"
                      :src="friend.avatar_url"
                      :alt="friend.display_name"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span class="text-sm font-bold text-white">{{ friend.display_name?.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div
                      v-if="friend.online"
                      class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-slate-950"
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="font-semibold">{{ friend.display_name }}</p>
                    <p class="text-sm text-slate-400 truncate">{{ friend.lastMessage }}</p>
                  </div>

                  <div v-if="dmUnreadCounts[friend.id]" class="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {{ dmUnreadCounts[friend.id] }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DM Conversation View -->
          <div v-else class="space-y-4">
            <!-- Back button and header -->
            <div class="flex items-center gap-3 mb-4">
              <button
                @click="selectedDmPartnerId = null"
                class="px-3 py-2 text-sm bg-slate-800/40 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <div class="flex-1">
                <p class="font-semibold">{{ selectedFriend?.display_name }}</p>
                <p class="text-sm text-slate-400">{{ selectedFriend?.online ? 'Online' : 'Offline' }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div
              class="h-80 overflow-y-auto p-4 bg-slate-900/30 rounded-lg border border-slate-700/30 backdrop-blur-sm"
              ref="dmMessagesContainer"
            >
              <div v-if="currentDmMessages.length === 0" class="text-center py-8">
                <p class="text-slate-400">No messages yet. Start a conversation!</p>
              </div>

              <div v-else class="space-y-2">
                <ChatBubble
                  v-for="msg in currentDmMessages"
                  :key="msg.id"
                  :message="msg"
                  :currentUserId="authStore.user.id"
                  @report="reportMessage"
                />

                <div v-if="typingDmList.length > 0" class="text-sm text-slate-400 italic">
                  {{ typingDmList.join(', ') }} {{ typingDmList.length === 1 ? 'is' : 'are' }} typing...
                </div>
              </div>
            </div>

            <!-- DM Message Input -->
            <div class="flex gap-2">
              <input
                v-model="dmInput"
                @keyup.enter="sendDM"
                type="text"
                placeholder="Type a message..."
                class="flex-1 px-4 py-3 bg-slate-800/60 text-slate-50 rounded-lg border border-slate-700/30 focus:border-blue-500 focus:outline-none transition-colors backdrop-blur-sm"
              />

              <button
                @click="showDmEmojiPicker = !showDmEmojiPicker"
                class="px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/30 transition-colors"
                title="Emoji picker"
              >
                😊
              </button>

              <button
                @click="sendDM"
                :disabled="!dmInput.trim()"
                class="px-6 py-3 bg-blue-600/60 hover:bg-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                Send
              </button>
            </div>

            <!-- DM Emoji Picker -->
            <div v-if="showDmEmojiPicker" class="relative">
              <EmojiPicker @select="insertDmEmoji" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden image input -->
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useFriendsStore } from '@/stores/friends';
import { useAuthStore } from '@/stores/auth';
import ChatBubble from '@/components/chat/ChatBubble.vue';
import EmojiPicker from '@/components/chat/EmojiPicker.vue';

const chatStore = useChatStore();
const friendsStore = useFriendsStore();
const authStore = useAuthStore();

const activeTab = ref('global');
const selectedDmPartnerId = ref(null);
const messageInput = ref('');
const dmInput = ref('');
const showEmojiPicker = ref(false);
const showDmEmojiPicker = ref(false);
const messagesContainer = ref(null);
const dmMessagesContainer = ref(null);
const imageInput = ref(null);

const dmUnreadCounts = computed(() => chatStore.dmUnreadCounts);

const dmList = computed(() => {
  return friendsStore.friends.map(friend => ({
    id: friend.id,
    display_name: friend.display_name,
    avatar_url: friend.avatar_url,
    online: friendsStore.onlineUsers.has(friend.id),
    lastMessage: chatStore.directMessages[friend.id]?.[chatStore.directMessages[friend.id].length - 1]?.content || 'No messages'
  }));
});

const selectedFriend = computed(() => {
  return friendsStore.friends.find(f => f.id === selectedDmPartnerId.value);
});

const currentDmMessages = computed(() => {
  return chatStore.directMessages[selectedDmPartnerId.value] || [];
});

const typingList = computed(() => {
  return chatStore.getTypingUsers('global', 'main');
});

const typingDmList = computed(() => {
  if (!selectedDmPartnerId.value) return [];
  return chatStore.getTypingUsers('dm', selectedDmPartnerId.value);
});

const sendGlobalMessage = async () => {
  if (!messageInput.value.trim()) return;

  try {
    await chatStore.sendGlobalMessage(messageInput.value);
    messageInput.value = '';
    showEmojiPicker.value = false;
    await nextTick();
    scrollToBottom(messagesContainer.value);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

const sendDM = async () => {
  if (!dmInput.value.trim() || !selectedDmPartnerId.value) return;

  try {
    await chatStore.sendDM(selectedDmPartnerId.value, dmInput.value);
    dmInput.value = '';
    showDmEmojiPicker.value = false;
    await nextTick();
    scrollToBottom(dmMessagesContainer.value);
  } catch (error) {
    console.error('Failed to send DM:', error);
  }
};

const loadMoreGlobalMessages = async () => {
  await chatStore.fetchGlobalMessages(chatStore.globalPage + 1);
};

const insertEmoji = (emoji) => {
  messageInput.value += emoji;
  showEmojiPicker.value = false;
};

const insertDmEmoji = (emoji) => {
  dmInput.value += emoji;
  showDmEmojiPicker.value = false;
};

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // In production, upload to storage and get URL
  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageUrl = e.target.result;

    if (activeTab.value === 'global') {
      await chatStore.sendGlobalMessage(imageUrl);
    } else if (selectedDmPartnerId.value) {
      await chatStore.sendDM(selectedDmPartnerId.value, imageUrl, 'image');
    }
  };
  reader.readAsDataURL(file);

  // Reset input
  imageInput.value.value = '';
};

const reportMessage = (message) => {
  // In production, send report to backend
  console.log('Report message:', message);
  alert('Message reported');
};

const scrollToBottom = (element) => {
  if (!element) return;
  element.scrollTop = element.scrollHeight;
};

// Watch for new messages and scroll
watch(() => chatStore.globalMessages.length, async () => {
  await nextTick();
  scrollToBottom(messagesContainer.value);
});

watch(() => currentDmMessages.value.length, async () => {
  await nextTick();
  scrollToBottom(dmMessagesContainer.value);
});

onMounted(async () => {
  await chatStore.initializeSubscriptions();
  await chatStore.fetchGlobalMessages();
  await friendsStore.fetchFriends();
  await friendsStore.fetchRequests();
  await friendsStore.subscribeToPresence();
});

onUnmounted(async () => {
  await chatStore.cleanupSubscriptions();
});
</script>
