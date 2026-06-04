<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <!-- Header -->
    <div class="bg-slate-900/50 border-b border-slate-700/30 backdrop-blur-md sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold">Friends</h1>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Tabs -->
      <div class="flex border-b border-slate-700/30">
        <button
          @click="activeTab = 'friends'"
          :class="[
            'flex-1 px-4 py-3 font-semibold transition-colors',
            activeTab === 'friends'
              ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          Friends ({{ friendsStore.friendCount }}/100)
        </button>
        <button
          @click="activeTab = 'requests'"
          :class="[
            'flex-1 px-4 py-3 font-semibold transition-colors relative',
            activeTab === 'requests'
              ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          Requests
          <span
            v-if="friendsStore.pendingRequestCount > 0"
            class="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ friendsStore.pendingRequestCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'search'"
          :class="[
            'flex-1 px-4 py-3 font-semibold transition-colors',
            activeTab === 'search'
              ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          Search
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-4 md:p-6">
        <!-- Friends Tab -->
        <div v-if="activeTab === 'friends'" class="space-y-4">
          <!-- Friend limit warning -->
          <div
            v-if="friendsStore.friendLimitWarning"
            class="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm"
          >
            You have {{ friendsStore.friendCount }} friends. Friend limit is 100.
          </div>

          <!-- Friends list -->
          <div v-if="friendsStore.friends.length === 0" class="text-center py-8">
            <p class="text-slate-400">No friends yet. Search for users to add!</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="friend in friendsStore.friends"
              :key="friend.id"
              class="p-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-lg border border-slate-700/30 transition-all backdrop-blur-sm"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img
                      v-if="friend.avatar_url"
                      :src="friend.avatar_url"
                      :alt="friend.display_name"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span class="text-sm font-bold text-white">{{ friend.display_name?.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div
                      v-if="friend.online"
                      class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"
                    />
                  </div>

                  <div>
                    <p class="font-semibold">{{ friend.display_name }}</p>
                    <p class="text-sm text-slate-400">{{ friend.online ? 'Online' : 'Offline' }}</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="openBlockMenu(friend.id)"
                    class="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/40 rounded transition-colors"
                    title="Block user"
                  >
                    🚫
                  </button>
                  <button
                    @click="removeFriend(friend.id)"
                    class="px-3 py-2 text-sm bg-red-600/40 hover:bg-red-600/60 text-red-200 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Friend Requests Tab -->
        <div v-if="activeTab === 'requests'" class="space-y-4">
          <div v-if="friendsStore.friendRequests.length === 0" class="text-center py-8">
            <p class="text-slate-400">No pending friend requests</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="request in friendsStore.friendRequests"
              :key="request.requestId"
              class="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 backdrop-blur-sm"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img
                    v-if="request.avatar_url"
                    :src="request.avatar_url"
                    :alt="request.display_name"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span class="text-sm font-bold text-white">{{ request.display_name?.charAt(0).toUpperCase() }}</span>
                  </div>

                  <p class="font-semibold">{{ request.display_name }}</p>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="acceptRequest(request.requestId)"
                    class="px-4 py-2 text-sm bg-green-600/60 hover:bg-green-600/80 text-green-100 rounded font-semibold transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    @click="declineRequest(request.requestId)"
                    class="px-4 py-2 text-sm bg-red-600/40 hover:bg-red-600/60 text-red-200 rounded transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Tab -->
        <div v-if="activeTab === 'search'" class="space-y-4">
          <!-- Search input -->
          <div class="flex gap-2 mb-4">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search users by name..."
              class="flex-1 px-4 py-3 bg-slate-800/60 text-slate-50 rounded-lg border border-slate-700/30 focus:border-blue-500 focus:outline-none transition-colors backdrop-blur-sm"
            />
          </div>

          <!-- Search results -->
          <div v-if="!searchQuery" class="text-center py-8">
            <p class="text-slate-400">Type a name to search for users</p>
          </div>

          <div v-else-if="friendsStore.loading" class="text-center py-8">
            <p class="text-slate-400">Searching...</p>
          </div>

          <div v-else-if="friendsStore.searchResults.length === 0" class="text-center py-8">
            <p class="text-slate-400">No users found</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="user in friendsStore.searchResults"
              :key="user.id"
              class="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 backdrop-blur-sm"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.display_name"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span class="text-sm font-bold text-white">{{ user.display_name?.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div
                      v-if="user.online"
                      class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"
                    />
                  </div>

                  <div>
                    <p class="font-semibold">{{ user.display_name }}</p>
                    <p class="text-sm text-slate-400">{{ user.online ? 'Online' : 'Offline' }}</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    v-if="!user.isFriend && !user.hasRequest && !user.isBlocked"
                    @click="sendRequest(user.id)"
                    :disabled="friendsStore.isFriendLimitReached"
                    class="px-4 py-2 text-sm bg-blue-600/60 hover:bg-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed text-blue-100 rounded font-semibold transition-colors"
                  >
                    Add Friend
                  </button>
                  <button
                    v-else-if="user.hasRequest"
                    disabled
                    class="px-4 py-2 text-sm bg-slate-700/40 text-slate-300 rounded font-semibold"
                  >
                    Request Sent
                  </button>
                  <button
                    v-else-if="user.isFriend"
                    disabled
                    class="px-4 py-2 text-sm bg-slate-700/40 text-slate-300 rounded font-semibold"
                  >
                    Friends
                  </button>
                  <button
                    v-if="user.isBlocked"
                    @click="unblockUser(user.id)"
                    class="px-4 py-2 text-sm bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 rounded transition-colors"
                  >
                    Unblock
                  </button>
                  <button
                    v-else
                    @click="openBlockMenu(user.id)"
                    class="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded transition-colors"
                    title="Block user"
                  >
                    🚫
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Block confirmation dialog -->
    <div
      v-if="blockMenuUserId"
      @click="blockMenuUserId = null"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div
        @click.stop
        class="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm"
      >
        <p class="text-slate-200 mb-4">Block this user? They won't be able to contact you.</p>
        <div class="flex gap-2 justify-end">
          <button
            @click="blockMenuUserId = null"
            class="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            @click="blockUser(blockMenuUserId)"
            class="px-4 py-2 bg-red-600/60 hover:bg-red-600/80 text-red-100 rounded font-semibold transition-colors"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFriendsStore } from '@/stores/friends';

const friendsStore = useFriendsStore();

const activeTab = ref('friends');
const searchQuery = ref('');
const blockMenuUserId = ref(null);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    friendsStore.searchResults = [];
    return;
  }
  await friendsStore.searchUsers(searchQuery.value);
};

const sendRequest = async (userId) => {
  try {
    await friendsStore.sendRequest(userId);
  } catch (error) {
    console.error('Failed to send friend request:', error);
  }
};

const acceptRequest = async (requestId) => {
  try {
    await friendsStore.acceptRequest(requestId);
  } catch (error) {
    console.error('Failed to accept request:', error);
  }
};

const declineRequest = async (requestId) => {
  try {
    await friendsStore.declineRequest(requestId);
  } catch (error) {
    console.error('Failed to decline request:', error);
  }
};

const removeFriend = async (friendId) => {
  if (confirm('Remove this friend?')) {
    try {
      await friendsStore.removeFriend(friendId);
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  }
};

const blockUser = async (userId) => {
  try {
    await friendsStore.blockUser(userId);
    blockMenuUserId.value = null;
  } catch (error) {
    console.error('Failed to block user:', error);
  }
};

const unblockUser = async (userId) => {
  try {
    await friendsStore.unblockUser(userId);
  } catch (error) {
    console.error('Failed to unblock user:', error);
  }
};

const openBlockMenu = (userId) => {
  blockMenuUserId.value = userId;
};

onMounted(async () => {
  await friendsStore.fetchFriends();
  await friendsStore.fetchRequests();
});
</script>
