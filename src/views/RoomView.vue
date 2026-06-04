<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <!-- No room: Room Browser -->
    <div v-if="!roomStore.currentRoom" class="flex-1 p-4">
      <div class="space-y-4">
        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-2xl font-bold">Room Browser</h1>
          <p class="text-slate-400">Join a game or create a new room</p>
        </div>

        <!-- Create Room Button -->
        <button
          @click="showCreateModal = true"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
        >
          + Create Room
        </button>

        <!-- Game Type Filter -->
        <div class="flex gap-2">
          <button
            v-for="type in ['all', 'chess', 'ludo', 'snakes']"
            :key="type"
            @click="selectedGameType = type === 'all' ? null : type"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition',
              (type === 'all' && !selectedGameType) || selectedGameType === type
                ? 'bg-purple-600'
                : 'bg-slate-800 hover:bg-slate-700'
            ]"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </button>
        </div>

        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search rooms..."
          class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
        />

        <!-- Room List -->
        <div class="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div
            v-if="filteredRooms.length === 0"
            class="text-center py-8 text-slate-400"
          >
            No rooms available. Create one to get started!
          </div>

          <div
            v-for="room in filteredRooms"
            :key="room.id"
            @click="joinRoomHandler(room.id)"
            class="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-semibold text-slate-50">Room {{ room.id }}</p>
                <p class="text-sm text-slate-400">
                  {{ room.game_type.charAt(0).toUpperCase() + room.game_type.slice(1) }}
                  - {{ room.mode }}
                </p>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold',
                  room.is_private ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                ]"
              >
                {{ room.is_private ? 'Private' : 'Public' }}
              </span>
            </div>
            <div class="text-sm text-slate-400 space-y-1">
              <p>Players: {{ room.player_count || 0 }}/{{ room.max_players }}</p>
              <p v-if="room.betting_enabled">Betting: {{ room.betting_min }}-{{ room.betting_max }} Koin</p>
              <p v-if="room.skills_enabled">Skills: Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- In Room: Lobby View -->
    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-slate-900 border-b border-slate-700 p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-2xl font-bold">Room {{ roomStore.currentRoom.id }}</h1>
            <p class="text-slate-400">
              {{ roomStore.currentRoom.game_type }} - {{ roomStore.currentRoom.mode }}
            </p>
          </div>
          <button
            @click="leaveRoomHandler"
            class="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg font-semibold transition"
          >
            Leave
          </button>
        </div>

        <!-- Room Config Display -->
        <div class="grid grid-cols-2 gap-2 text-sm text-slate-300">
          <div v-if="roomStore.currentRoom.skills_enabled" class="flex items-center gap-1">
            <span class="text-purple-400">✓</span> Skills Enabled
          </div>
          <div v-if="roomStore.currentRoom.betting_enabled" class="flex items-center gap-1">
            <span class="text-green-400">✓</span> Betting {{ roomStore.currentRoom.betting_min }}-{{ roomStore.currentRoom.betting_max }}
          </div>
          <div class="flex items-center gap-1">
            <span class="text-blue-400">⏱</span> Timer: {{ roomStore.currentRoom.timer_seconds }}s
          </div>
          <div class="flex items-center gap-1">
            <span class="text-yellow-400">👥</span> Max: {{ roomStore.currentRoom.max_players }}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Player List -->
        <div>
          <h2 class="text-lg font-bold mb-3">Players ({{ roomStore.players.length }})</h2>
          <div class="space-y-2">
            <div
              v-for="player in roomStore.players"
              :key="player.id"
              class="bg-slate-800 p-3 rounded-lg flex justify-between items-center"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {{ player.user_id.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold">Player {{ player.user_id.substring(0, 8) }}</p>
                  <p class="text-xs text-slate-400">
                    {{ player.is_spectator ? 'Spectating' : 'Playing' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-semibold',
                    roomStore.readyStatus[player.user_id]
                      ? 'bg-green-900 text-green-200'
                      : 'bg-slate-700 text-slate-300'
                  ]"
                >
                  {{ roomStore.readyStatus[player.user_id] ? 'Ready' : 'Not Ready' }}
                </span>
                <span v-if="roomStore.currentRoom.betting_enabled && player.bet_amount > 0" class="text-sm text-yellow-400">
                  {{ player.bet_amount }} Koin
                </span>
                <button
                  v-if="roomStore.isHost && player.user_id !== currentUser?.id"
                  @click="kickPlayerHandler(player.user_id)"
                  class="px-2 py-1 bg-red-900 hover:bg-red-800 rounded text-xs font-semibold transition"
                >
                  Kick
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Betting Display -->
        <div v-if="roomStore.currentRoom.betting_enabled" class="bg-gradient-to-r from-amber-900 to-amber-800 p-4 rounded-lg">
          <p class="text-sm text-amber-200 mb-1">Pot Total</p>
          <p class="text-3xl font-bold text-amber-300">{{ roomStore.currentRoom.pot_total }} Koin</p>
        </div>

        <!-- RPS Challenges -->
        <div>
          <h2 class="text-lg font-bold mb-2">Quick Play</h2>
          <button
            class="w-full px-4 py-3 bg-blue-900 hover:bg-blue-800 rounded-lg font-semibold transition"
          >
            Rock, Paper, Scissors vs Player
          </button>
        </div>
      </div>

      <!-- Footer Controls -->
      <div class="bg-slate-900 border-t border-slate-700 p-4 space-y-2">
        <button
          @click="toggleReadyHandler"
          :class="[
            'w-full py-3 rounded-lg font-semibold transition',
            roomStore.readyStatus[currentUser?.id]
              ? 'bg-green-900 hover:bg-green-800'
              : 'bg-purple-600 hover:bg-purple-700'
          ]"
        >
          {{ roomStore.readyStatus[currentUser?.id] ? 'Not Ready' : 'Ready' }}
        </button>
        <button
          v-if="roomStore.isHost && roomStore.canStartGame"
          @click="startMatchHandler"
          class="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition"
        >
          Start Game
        </button>
        <button
          v-else-if="roomStore.isHost"
          disabled
          class="w-full py-3 bg-slate-700 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
        >
          Waiting for Players...
        </button>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      @click="showCreateModal = false"
    >
      <div
        class="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="text-2xl font-bold mb-4">Create Room</h2>

        <div class="space-y-4">
          <!-- Game Type -->
          <div>
            <label class="block text-sm font-semibold mb-2">Game Type</label>
            <select
              v-model="createConfig.gameType"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
            >
              <option value="chess">Chess</option>
              <option value="ludo">Ludo</option>
              <option value="snakes">Snakes & Ladders</option>
            </select>
          </div>

          <!-- Mode -->
          <div>
            <label class="block text-sm font-semibold mb-2">Game Mode</label>
            <select
              v-model="createConfig.mode"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
            >
              <option value="classic">Classic</option>
              <option value="adventure">Adventure</option>
              <option value="ranked">Ranked</option>
            </select>
          </div>

          <!-- Max Players -->
          <div>
            <label class="block text-sm font-semibold mb-2">Max Players</label>
            <select
              v-model.number="createConfig.maxPlayers"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <!-- Timer -->
          <div>
            <label class="block text-sm font-semibold mb-2">Timer (seconds)</label>
            <input
              v-model.number="createConfig.timer"
              type="number"
              min="60"
              max="3600"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
            />
          </div>

          <!-- Skills -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="createConfig.skillsEnabled"
                type="checkbox"
                class="w-4 h-4"
              />
              <span class="font-semibold">Enable Skills</span>
            </label>
          </div>

          <!-- Betting -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input
                v-model="createConfig.bettingEnabled"
                type="checkbox"
                class="w-4 h-4"
              />
              <span class="font-semibold">Enable Betting</span>
            </label>
            <div v-if="createConfig.bettingEnabled" class="space-y-2">
              <input
                v-model.number="createConfig.bettingMin"
                type="number"
                placeholder="Min bet"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
              />
              <input
                v-model.number="createConfig.bettingMax"
                type="number"
                placeholder="Max bet"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
              />
            </div>
          </div>

          <!-- Private Room -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input
                v-model="createConfig.isPrivate"
                type="checkbox"
                class="w-4 h-4"
              />
              <span class="font-semibold">Private Room</span>
            </label>
            <input
              v-if="createConfig.isPrivate"
              v-model="createConfig.pin"
              type="text"
              placeholder="Room PIN (optional)"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2 mt-6">
          <button
            @click="showCreateModal = false"
            class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            @click="createRoomHandler"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 rounded-lg font-semibold transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoomStore } from '@/stores/room';
import { useAuthStore } from '@/stores/auth';

const roomStore = useRoomStore();
const authStore = useAuthStore();

const currentUser = ref(null);
const showCreateModal = ref(false);
const selectedGameType = ref(null);
const searchQuery = ref('');

const createConfig = ref({
  gameType: 'chess',
  mode: 'classic',
  maxPlayers: 2,
  timer: 300,
  skillsEnabled: false,
  bettingEnabled: false,
  bettingMin: 50,
  bettingMax: 1000,
  isPrivate: false,
  pin: '',
});

const filteredRooms = computed(() => {
  return roomStore.roomList.filter((room) => {
    const matchesGameType = !selectedGameType.value || room.game_type === selectedGameType.value;
    const matchesSearch = searchQuery.value === '' || room.id.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesGameType && matchesSearch;
  });
});

const createRoomHandler = async () => {
  try {
    await roomStore.createRoom(createConfig.value);
    showCreateModal.value = false;
  } catch (error) {
    alert('Failed to create room: ' + error.message);
  }
};

const joinRoomHandler = async (roomId) => {
  try {
    await roomStore.joinRoom(roomId);
  } catch (error) {
    alert('Failed to join room: ' + error.message);
  }
};

const leaveRoomHandler = async () => {
  try {
    await roomStore.leaveRoom();
  } catch (error) {
    alert('Failed to leave room: ' + error.message);
  }
};

const toggleReadyHandler = async () => {
  try {
    await roomStore.toggleReady();
  } catch (error) {
    alert('Failed to toggle ready: ' + error.message);
  }
};

const startMatchHandler = async () => {
  try {
    await roomStore.startMatch();
  } catch (error) {
    alert('Failed to start match: ' + error.message);
  }
};

const kickPlayerHandler = async (playerId) => {
  try {
    await roomStore.kickPlayer(playerId);
  } catch (error) {
    alert('Failed to kick player: ' + error.message);
  }
};

onMounted(async () => {
  const { data: { user } } = await authStore.supabase.auth.getUser();
  currentUser.value = user;

  if (!roomStore.currentRoom) {
    await roomStore.fetchPublicRooms();
  }
});

onUnmounted(() => {
  if (roomStore.currentRoom) {
    roomStore.unsubscribeFromRoom();
  }
});
</script>
