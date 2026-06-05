<template>
  <div class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="logo-section">
        <h1 class="text-xl font-bold text-white">Admin</h1>
        <p class="text-xs text-gray-400">Control Panel</p>
      </div>
      <button
        @click="toggleCollapse"
        class="collapse-btn"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Menu items -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.id"
        :to="item.path"
        :title="isCollapsed ? item.label : ''"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">
          <component :is="item.icon" class="w-5 h-5" />
        </span>
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <!-- Settings section -->
    <nav class="sidebar-nav">
      <router-link
        to="/admin/settings"
        :title="isCollapsed ? 'Settings' : ''"
        class="nav-item"
        :class="{ active: isActive('/admin/settings') }"
      >
        <span class="nav-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </span>
        <span v-if="!isCollapsed" class="nav-label">Settings</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button
        @click="handleLogout"
        class="logout-btn"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          ></path>
        </svg>
        <span v-if="!isCollapsed" class="ml-2">Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRBAC } from '@/composables/useRBAC'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const rbac = useRBAC()
const isCollapsed = ref(false)

const allMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: 'DashboardIcon',
    minLevel: 2,
  },
  {
    id: 'users',
    label: 'Users & Roles',
    path: '/admin/users',
    icon: 'UsersIcon',
    minLevel: 2,
  },
  {
    id: 'rooms',
    label: 'Rooms',
    path: '/admin/rooms',
    icon: 'RoomsIcon',
    minLevel: 2,
  },
  {
    id: 'matches',
    label: 'Matches',
    path: '/admin/matches',
    icon: 'MatchesIcon',
    minLevel: 2,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    path: '/admin/leaderboard',
    icon: 'LeaderboardIcon',
    minLevel: 2,
  },
  {
    id: 'economy',
    label: 'Economy',
    path: '/admin/economy',
    icon: 'EconomyIcon',
    minLevel: 3,
  },
  {
    id: 'shop',
    label: 'Shop',
    path: '/admin/shop',
    icon: 'ShopIcon',
    minLevel: 3,
  },
  {
    id: 'moderation',
    label: 'Moderation',
    path: '/admin/moderation',
    icon: 'ModerationIcon',
    minLevel: 2,
  },
  {
    id: 'ads',
    label: 'Ads',
    path: '/admin/ads',
    icon: 'AdsIcon',
    minLevel: 3,
  },
  {
    id: 'broadcast',
    label: 'Broadcast',
    path: '/admin/broadcast',
    icon: 'BroadcastIcon',
    minLevel: 3,
  },
]

const menuItems = computed(() => {
  return allMenuItems.filter((item) => rbac.currentLevel.value >= item.minLevel)
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const isActive = (path) => {
  return route.path === path
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Icon components (inline SVGs)
const DashboardIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5"></path>
  </svg>`
}

const UsersIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 14H5.373A6.627 6.627 0 000 20.627V22h24v-1.373A6.627 6.627 0 0018.627 14H12z"></path>
  </svg>`
}

const RoomsIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
  </svg>`
}

const MatchesIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`
}

const LeaderboardIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>`
}

const EconomyIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`
}

const ShopIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
  </svg>`
}

const ModerationIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 5v.01M6.172 5.172a4 4 0 015.656 0L12 6.343l.172-.171a4 4 0 00-5.656 0M12 3a9 9 0 110 18 9 9 0 010-18z"></path>
  </svg>`
}

const AdsIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
  </svg>`
}

const BroadcastIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.961 1.961 0 01-2.437-1.971V5.882m0 0V5c0-1.657.895-3 2-3s2 1.343 2 3v.882m0 0A1.96 1.96 0 0112 5c0-1.657.895-3 2-3s2 1.343 2 3m0 0V5.882"></path>
  </svg>`
}
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.admin-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  flex: 1;
}

.logo-section h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.5);
  color: #667eea;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.8);
  transform: scale(1.05);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #9ca3af;
  text-decoration: none;
  border-radius: 0.5rem;
  margin: 0.25rem 0;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-left-color: #667eea;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
  border-left-color: #667eea;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
}

.admin-sidebar.collapsed .sidebar-nav {
  padding: 1rem 0.25rem;
}

.admin-sidebar.collapsed .nav-item {
  padding: 0.75rem;
  justify-content: center;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}
</style>
