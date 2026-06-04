<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <!-- Header -->
    <div class="bg-slate-900 border-b border-slate-700 p-4">
      <h1 class="text-3xl font-bold mb-4">Leaderboard</h1>

      <!-- Game Type Tabs -->
      <div class="flex gap-2 border-b border-slate-700 overflow-x-auto">
        <button
          v-for="game in ['Overall', 'Chess', 'Ludo', 'Snakes']"
          :key="game"
          @click="selectedGame = game.toLowerCase()"
          :class="[
            'px-4 py-2 font-semibold whitespace-nowrap transition border-b-2',
            selectedGame === game.toLowerCase()
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          ]"
        >
          {{ game }}
        </button>
      </div>

      <!-- Period Tabs -->
      <div class="flex gap-2 mt-3 overflow-x-auto">
        <button
          v-for="period in ['Daily', 'Weekly', 'All-Time']"
          :key="period"
          @click="selectedPeriod = period.toLowerCase().replace('-', '_')"
          :class="[
            'px-3 py-1 text-sm font-semibold rounded transition',
            selectedPeriod === period.toLowerCase().replace('-', '_')
              ? 'bg-purple-600'
              : 'bg-slate-800 hover:bg-slate-700'
          ]"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-slate-900 border-b border-slate-700 p-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search player..."
        class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
      />
    </div>

    <!-- Leaderboard Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-center py-8 text-slate-400">
        Loading leaderboard...
      </div>

      <div v-else-if="filteredLeaderboard.length === 0" class="text-center py-8 text-slate-400">
        No players found
      </div>

      <div v-else class="space-y-2">
        <!-- Top 3 Special Display -->
        <div v-if="topThree.length > 0" class="grid grid-cols-3 gap-2 mb-6">
          <div
            v-for="(entry, index) in topThree"
            :key="index"
            :class="[
              'text-center p-4 rounded-lg border-2',
              index === 0
                ? 'bg-gradient-to-b from-yellow-900 to-amber-900 border-yellow-600'
                : index === 1
                  ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600'
                  : 'bg-gradient-to-b from-orange-900 to-amber-900 border-orange-700'
            ]"
          >
            <p class="text-2xl font-bold mb-1">{{ ['1st', '2nd', '3rd'][index] }}</p>
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg',
                index === 0
                  ? 'bg-yellow-600'
                  : index === 1
                    ? 'bg-slate-600'
                    : 'bg-orange-600'
              ]"
            >
              {{ entry.name.substring(0, 2).toUpperCase() }}
            </div>
            <p class="font-semibold text-sm">{{ entry.name }}</p>
            <p class="text-lg font-bold mt-1">
              {{ selectedGame === 'overall' ? entry.total_elo : entry.elo }} ELO
            </p>
            <p class="text-xs text-slate-300">{{ entry.win_rate || 0 }}% W/R</p>
          </div>
        </div>

        <!-- Main Leaderboard List -->
        <div class="space-y-1">
          <div
            v-for="(entry, index) in restOfLeaderboard"
            :key="entry.id"
            :class="[
              'flex items-center gap-3 p-3 rounded-lg transition',
              entry.is_current_user
                ? 'bg-purple-900/30 border border-purple-500'
                : 'bg-slate-800 hover:bg-slate-700'
            ]"
          >
            <!-- Rank -->
            <div class="w-8 text-center font-bold text-lg text-slate-400">
              #{{ index + 4 }}
            </div>

            <!-- Avatar -->
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              {{ entry.name.substring(0, 2).toUpperCase() }}
            </div>

            <!-- Player Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ entry.name }}</p>
              <p class="text-xs text-slate-400">{{ entry.total_games || 0 }} matches</p>
            </div>

            <!-- ELO and Win Rate -->
            <div class="text-right">
              <p class="font-bold text-lg">{{ selectedGame === 'overall' ? entry.total_elo : entry.elo }} ELO</p>
              <p class="text-xs text-slate-400">{{ entry.win_rate || 0 }}% W/R</p>
            </div>

            <!-- You Badge -->
            <span v-if="entry.is_current_user" class="px-2 py-1 bg-purple-600 text-xs font-semibold rounded">
              YOU
            </span>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            Previous
          </button>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">Page {{ currentPage }} of {{ totalPages }}</span>
          </div>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const loading = ref(false);
const selectedGame = ref('overall');
const selectedPeriod = ref('all_time');
const searchQuery = ref('');
const currentPage = ref(1);
const leaderboardData = ref([]);
const currentUserId = ref(null);

const pageSize = 20;

const filteredLeaderboard = computed(() => {
  let data = leaderboardData.value;

  if (searchQuery.value) {
    data = data.filter((entry) =>
      entry.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return data.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize);
});

const topThree = computed(() => {
  return filteredLeaderboard.value.slice(0, 3);
});

const restOfLeaderboard = computed(() => {
  return filteredLeaderboard.value.slice(3);
});

const totalPages = computed(() => {
  return Math.ceil(leaderboardData.value.length / pageSize);
});

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId.value = user?.id;

    let query = supabase
      .from('users')
      .select('id, username, chess_elo, ludo_elo, snakes_elo, total_elo, total_games, win_rate, created_at')
      .order(
        selectedGame.value === 'overall' ? 'total_elo' : `${selectedGame.value}_elo`,
        { ascending: false }
      )
      .limit(100);

    const { data, error } = await query;

    if (error) throw error;

    leaderboardData.value = (data || []).map((entry) => ({
      ...entry,
      name: entry.username || `User ${entry.id.substring(0, 8)}`,
      is_current_user: entry.id === currentUserId.value,
      elo:
        selectedGame.value === 'chess'
          ? entry.chess_elo || 1000
          : selectedGame.value === 'ludo'
            ? entry.ludo_elo || 1000
            : selectedGame.value === 'snakes'
              ? entry.snakes_elo || 1000
              : entry.total_elo || 3000,
    }));

    currentPage.value = 1;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLeaderboard();
});
</script>
