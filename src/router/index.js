import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views (lazy loaded)
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const GameView = () => import('@/views/GameView.vue')
const RoomView = () => import('@/views/RoomView.vue')
const ShopView = () => import('@/views/ShopView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const LeaderboardView = () => import('@/views/LeaderboardView.vue')
const FriendsView = () => import('@/views/FriendsView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const TermsView = () => import('@/views/TermsView.vue')
const PrivacyView = () => import('@/views/PrivacyView.vue')

// Admin Views (lazy loaded)
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const AdminUsers = () => import('@/views/admin/AdminUsers.vue')
const AdminRooms = () => import('@/views/admin/AdminRooms.vue')
const AdminMatches = () => import('@/views/admin/AdminMatches.vue')
const AdminLeaderboard = () => import('@/views/admin/AdminLeaderboard.vue')
const AdminEconomy = () => import('@/views/admin/AdminEconomy.vue')
const AdminShop = () => import('@/views/admin/AdminShop.vue')
const AdminModeration = () => import('@/views/admin/AdminModeration.vue')
const AdminAds = () => import('@/views/admin/AdminAds.vue')
const AdminBroadcast = () => import('@/views/admin/AdminBroadcast.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings.vue')

const routes = [
  { path: '/', component: HomeView, name: 'home' },
  { path: '/login', component: LoginView, name: 'login' },
  { path: '/register', component: RegisterView, name: 'register' },
  { path: '/terms', component: TermsView, name: 'terms' },
  { path: '/privacy', component: PrivacyView, name: 'privacy' },
  {
    path: '/dashboard',
    component: DashboardView,
    name: 'dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:type',
    component: GameView,
    name: 'game',
    meta: { requiresAuth: false }
  },
  {
    path: '/room/:id',
    component: RoomView,
    name: 'room',
    meta: { requiresAuth: true }
  },
  {
    path: '/shop',
    component: ShopView,
    name: 'shop',
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    component: ProfileView,
    name: 'profile',
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    component: LeaderboardView,
    name: 'leaderboard'
  },
  {
    path: '/friends',
    component: FriendsView,
    name: 'friends',
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    component: ChatView,
    name: 'chat',
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: AdminDashboard,
    name: 'adminDashboard',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    component: AdminUsers,
    name: 'adminUsers',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/rooms',
    component: AdminRooms,
    name: 'adminRooms',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/matches',
    component: AdminMatches,
    name: 'adminMatches',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/leaderboard',
    component: AdminLeaderboard,
    name: 'adminLeaderboard',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/economy',
    component: AdminEconomy,
    name: 'adminEconomy',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/shop',
    component: AdminShop,
    name: 'adminShop',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/moderation',
    component: AdminModeration,
    name: 'adminModeration',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/ads',
    component: AdminAds,
    name: 'adminAds',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/broadcast',
    component: AdminBroadcast,
    name: 'adminBroadcast',
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/settings',
    component: AdminSettings,
    name: 'adminSettings',
    meta: { requiresAdmin: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ensure auth is initialized
  if (authStore.isLoading) {
    await authStore.initialize()
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
  } else if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
