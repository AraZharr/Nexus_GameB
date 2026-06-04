<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
    <!-- Header with Welcome & Balance -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-4">
      <div class="space-y-4">
        <!-- Welcome -->
        <div>
          <p class="text-slate-400 text-sm">Welcome back,</p>
          <h1 class="text-3xl font-bold">{{ displayName }}</h1>
        </div>

        <!-- Balance Display -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Koin Balance</p>
            <p class="text-2xl font-bold text-yellow-400">{{ userBalance.koin }}</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Diamond Balance</p>
            <p class="text-2xl font-bold text-cyan-400">{{ userBalance.diamond }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Daily Login Claim -->
      <div
        v-if="!dailyClaimedToday"
        class="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-700 p-4 rounded-lg cursor-pointer hover:shadow-lg hover:shadow-purple-500/30 transition"
        @click="claimDailyReward"
      >
        <p class="font-semibold mb-1">Daily Login Reward</p>
        <p class="text-sm text-purple-200 mb-3">Claim your daily bonus!</p>
        <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm transition">
          Claim Reward
        </button>
      </div>

      <div v-else class="bg-slate-800 border border-slate-700 p-4 rounded-lg">
        <p class="font-semibold text-green-400">Daily reward claimed!</p>
        <p class="text-sm text-slate-400">Check back tomorrow</p>
      </div>

      <!-- Quick Play Buttons -->
      <div>
        <h2 class="text-lg font-bold mb-3">Quick Play</h2>
        <div class="grid grid-cols-3 gap-2">
          <router-link
            to="/game/chess"
            class="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg text-center hover:shadow-lg hover:shadow-blue-500/30 transition"
          >
            <div class="text-2xl mb-2">♞</div>
            <p class="font-semibold text-sm">Chess</p>
          </router-link>
          <router-link
            to="/game/ludo"
            class="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg text-center hover:shadow-lg hover:shadow-green-500/30 transition"
          >
            <div class="text-2xl mb-2">🎲</div>
            <p class="font-semibold text-sm">Ludo</p>
          </router-link>
          <router-link
            to="/game/snakes"
            class="bg-gradient-to-br from-orange-900 to-orange-800 p-4 rounded-lg text-center hover:shadow-lg hover:shadow-orange-500/30 transition"
          >
            <div class="text-2xl mb-2">🐍</div>
            <p class="font-semibold text-sm">Snakes</p>
          </router-link>
        </div>
      </div>

      <!-- Daily Quests -->
      <div>
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold">Daily Quests</h2>
          <span class="text-xs bg-purple-600 px-2 py-1 rounded">{{ completedQuests }}/{{ dailyQuests.length }}</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="quest in dailyQuests"
            :key="quest.id"
            class="bg-slate-800 border border-slate-700 p-3 rounded-lg"
          >
            <div class="flex justify-between items-start mb-2">
              <p class="font-semibold text-sm">{{ quest.name }}</p>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded font-semibold',
                  quest.completed
                    ? 'bg-green-900 text-green-200'
                    : 'bg-slate-700 text-slate-300'
                ]"
              >
                {{ quest.completed ? 'Complete' : 'Active' }}
              </span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2 mb-1">
              <div
                class="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                :style="{ width: `${(quest.progress / quest.target) * 100}%` }"
              />
            </div>
            <div class="flex justify-between items-center text-xs text-slate-400">
              <span>{{ quest.progress }}/{{ quest.target }}</span>
              <span class="text-yellow-400 font-semibold">+{{ quest.reward }} Koin</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Matches -->
      <div>
        <h2 class="text-lg font-bold mb-3">Recent Matches</h2>
        <div class="space-y-2">
          <div
            v-for="match in recentMatches"
            :key="match.id"
            class="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <p class="font-semibold">{{ match.game }} - {{ match.mode }}</p>
              <p class="text-xs text-slate-400">{{ match.date }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-semibold',
                match.result === 'Win'
                  ? 'bg-green-900 text-green-200'
                  : match.result === 'Loss'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-slate-700 text-slate-300'
              ]"
            >
              {{ match.result }}
            </span>
          </div>
          <div v-if="recentMatches.length === 0" class="text-center py-4 text-slate-400 text-sm">
            No recent matches. Play a game to get started!
          </div>
        </div>
      </div>

      <!-- Online Friends -->
      <div class="bg-slate-800 border border-slate-700 p-4 rounded-lg">
        <p class="font-semibold mb-2">Online Friends</p>
        <p class="text-2xl font-bold text-cyan-400">{{ onlineFriendsCount }}</p>
        <router-link
          to="/friends"
          class="mt-3 inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
        >
          View All Friends
        </router-link>
      </div>

      <!-- Latest Achievement -->
      <div v-if="latestAchievement" class="bg-gradient-to-r from-amber-900 to-yellow-900 border border-amber-700 p-4 rounded-lg">
        <p class="text-xs text-amber-200 mb-1">NEW ACHIEVEMENT!</p>
        <p class="font-bold text-lg">{{ latestAchievement.name }}</p>
        <p class="text-sm text-amber-100 mb-2">{{ latestAchievement.description }}</p>
        <p class="text-xs text-amber-300">
          +{{ latestAchievement.reward_koin }} Koin, +{{ latestAchievement.reward_diamond }} Diamond
        </p>
      </div>
    </div>

    <!-- Footer Navigation -->
    <div class="bg-slate-900 border-t border-slate-700 p-4 grid grid-cols-4 gap-2 text-xs text-center">
      <router-link
        to="/dashboard"
        class="py-2 px-1 rounded-lg hover:bg-slate-800 transition font-semibold text-purple-400"
      >
        Home
      </router-link>
      <router-link
        to="/room"
        class="py-2 px-1 rounded-lg hover:bg-slate-800 transition font-semibold"
      >
        Play
      </router-link>
      <router-link
        to="/leaderboard"
        class="py-2 px-1 rounded-lg hover:bg-slate-800 transition font-semibold"
      >
        Leaderboard
      </router-link>
      <router-link
        to="/profile"
        class="py-2 px-1 rounded-lg hover:bg-slate-800 transition font-semibold"
      >
        Profile
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import { useEconomyStore } from '@/stores/economy';

const economyStore = useEconomyStore();

const displayName = ref('Player');
const userBalance = ref({ koin: 0, diamond: 0 });
const dailyClaimedToday = ref(false);
const dailyQuests = ref([
  { id: 1, name: 'Win 3 matches', target: 3, progress: 1, completed: false, reward: 100 },
  { id: 2, name: 'Play 5 matches', target: 5, progress: 2, completed: false, reward: 50 },
  { id: 3, name: 'Use a skill', target: 1, progress: 0, completed: false, reward: 75 },
]);
const onlineFriendsCount = ref(0);
const latestAchievement = ref(null);
const recentMatches = ref([
  { id: 1, game: 'Chess', mode: 'Classic', result: 'Win', date: '2 hours ago' },
  { id: 2, game: 'Ludo', mode: 'Ranked', result: 'Loss', date: '5 hours ago' },
]);

const completedQuests = ref(0);

const claimDailyReward = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Add to economy
    await economyStore.addCurrency(user.id, 'koin', 50, 'daily_login');

    dailyClaimedToday.value = true;
    userBalance.value.koin += 50;
  } catch (error) {
    console.error('Error claiming reward:', error);
  }
};

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user data
    const { data: userData } = await supabase
      .from('users')
      .select('username, koin_balance, diamond_balance')
      .eq('id', user.id)
      .single();

    if (userData) {
      displayName.value = userData.username || 'Player';
      userBalance.value = {
        koin: userData.koin_balance || 0,
        diamond: userData.diamond_balance || 0,
      };
    }

    // Check if daily reward claimed today
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyData } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .limit(1);

    if (dailyData && dailyData.length > 0) {
      dailyClaimedToday.value = true;
    }

    // Fetch latest achievement
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id)
      .eq('unlocked', true)
      .order('unlocked_at', { ascending: false })
      .limit(1);

    if (achievements && achievements.length > 0) {
      latestAchievement.value = achievements[0].achievements;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
});
</script>
