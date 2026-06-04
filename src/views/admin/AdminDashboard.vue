<template>
  <div class="admin-dashboard">
    <AdminSidebar />

    <div class="dashboard-content">
      <!-- Header -->
      <div class="content-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's your system overview.</p>
        </div>
        <div class="header-actions">
          <button class="action-btn refresh-btn" @click="refreshData" :disabled="isRefreshing">
            <svg class="w-5 h-5" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <StatCard :value="stats.dau" label="Daily Active Users" variant="blue" :trend="stats.dauTrend" :trend-value="stats.dauTrendValue" :format="formatNumber" />
        <StatCard :value="stats.totalMatches" label="Total Matches" variant="green" :trend="stats.matchesTrend" :trend-value="stats.matchesTrendValue" :format="formatNumber" />
        <StatCard :value="formatRevenue(stats.revenue)" label="Revenue" variant="orange" :trend="stats.revenueTrend" :trend-value="stats.revenueTrendValue" />
        <StatCard :value="stats.activeRooms" label="Active Rooms" variant="red" :format="formatNumber" />
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-placeholder">
          <h3 class="chart-title">Matches Over Time</h3>
          <div class="chart-area">
            <svg viewBox="0 0 400 200" class="chart-svg">
              <text x="200" y="100" text-anchor="middle" dy=".3em">Chart.js Integration</text>
            </svg>
          </div>
        </div>

        <div class="chart-placeholder">
          <h3 class="chart-title">Revenue Distribution</h3>
          <div class="chart-area">
            <svg viewBox="0 0 400 200" class="chart-svg">
              <text x="200" y="100" text-anchor="middle" dy=".3em">Chart.js Integration</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Recent Matches Table -->
      <div class="recent-matches-section">
        <div class="section-header">
          <h2 class="section-title">Recent Matches</h2>
          <router-link to="/admin/matches" class="view-all-link">View All →</router-link>
        </div>

        <DataTable :columns="matchColumns" :data="recentMatches" :loading="isLoadingMatches" :searchable="false" :page-size="10" :row-actions="matchActions" empty-message="No matches found">
          <template #cell-winner="{ value }"><span class="user-badge">{{ value }}</span></template>
          <template #cell-loser="{ value }"><span class="user-badge">{{ value }}</span></template>
          <template #cell-reward="{ value }"><span class="reward-badge">+{{ value }} Koin</span></template>
          <template #cell-status="{ value }"><span class="status-badge" :class="`status-${value.toLowerCase()}`">{{ value }}</span></template>
        </DataTable>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <button class="quick-action-btn" @click="toggleMaintenance">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{{ maintenanceMode ? 'End Maintenance' : 'Start Maintenance' }}</span>
          </button>

          <button class="quick-action-btn" @click="showBroadcastModal = true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.961 1.961 0 01-2.437-1.971V5.882m0 0V5c0-1.657.895-3 2-3s2 1.343 2 3v.882m0 0A1.96 1.96 0 012 5c0-1.657.895-3 2-3s2 1.343 2 3m0 0A1.961 1.961 0 0110 3.882"></path></svg>
            <span>Send Broadcast</span>
          </button>

          <button class="quick-action-btn" @click="exportData">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Broadcast Modal -->
    <div v-if="showBroadcastModal" class="modal-overlay" @click="showBroadcastModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Send Broadcast</h3>
          <button @click="showBroadcastModal = false" class="modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea v-model="broadcastMessage" class="form-textarea" rows="5" placeholder="Enter your message..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Target Users</label>
            <select v-model="broadcastTarget" class="form-select">
              <option value="all">All Users</option>
              <option value="online">Online Users</option>
              <option value="vip">VIP Users</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showBroadcastModal = false" class="btn-secondary">Cancel</button>
          <button @click="sendBroadcast" class="btn-primary">Send Broadcast</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import StatCard from '../../components/admin/StatCard.vue'
import DataTable from '../../components/admin/DataTable.vue'

const isRefreshing = ref(false)
const isLoadingMatches = ref(false)
const maintenanceMode = ref(false)
const showBroadcastModal = ref(false)
const broadcastMessage = ref('')
const broadcastTarget = ref('all')

const stats = reactive({
  dau: 4521,
  dauTrend: 'up',
  dauTrendValue: 12,
  totalMatches: 28543,
  matchesTrend: 'up',
  matchesTrendValue: 8,
  revenue: 5234.50,
  revenueTrend: 'up',
  revenueTrendValue: 15,
  activeRooms: 245
})

const matchColumns = [
  { key: 'id', label: 'Match ID', sortable: true },
  { key: 'winner', label: 'Winner', sortable: true },
  { key: 'loser', label: 'Loser', sortable: true },
  { key: 'gameType', label: 'Game', sortable: true },
  { key: 'reward', label: 'Reward', sortable: true },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'status', label: 'Status', sortable: false }
]

const recentMatches = [
  { id: '#M001', winner: 'Player_A', loser: 'Player_B', gameType: 'RPS', reward: 10, createdAt: '2024-01-15 14:30', status: 'Completed' },
  { id: '#M002', winner: 'Player_C', loser: 'Player_D', gameType: 'Chess', reward: 50, createdAt: '2024-01-15 14:25', status: 'Completed' },
  { id: '#M003', winner: 'Player_E', loser: 'Player_F', gameType: 'RPS', reward: 10, createdAt: '2024-01-15 14:20', status: 'Completed' },
  { id: '#M004', winner: 'Player_G', loser: 'Player_H', gameType: 'RPS', reward: 25, createdAt: '2024-01-15 14:15', status: 'Completed' },
  { id: '#M005', winner: 'Player_I', loser: 'Player_J', gameType: 'Chess', reward: 50, createdAt: '2024-01-15 14:10', status: 'Completed' }
]

const matchActions = [
  { id: 'view', label: 'View', handler: (item) => console.log('View match:', item) },
  { id: 'details', label: 'Details', handler: (item) => console.log('Match details:', item) }
]

const formatNumber = (value) => typeof value === 'number' ? value.toLocaleString('en-US') : value

const formatRevenue = (value) => `$${value.toFixed(2)}`

const refreshData = async () => {
  isRefreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshing.value = false
}

const toggleMaintenance = () => {
  maintenanceMode.value = !maintenanceMode.value
  console.log('Maintenance mode:', maintenanceMode.value)
}

const sendBroadcast = () => {
  console.log('Broadcasting:', { message: broadcastMessage.value, target: broadcastTarget.value })
  broadcastMessage.value = ''
  broadcastTarget.value = 'all'
  showBroadcastModal.value = false
}

const exportData = () => {
  console.log('Exporting data...')
}
</script>

<style scoped>
.admin-dashboard { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.dashboard-content { flex: 1; overflow-y: auto; padding: 2rem; }
.content-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { color: #9ca3af; font-size: 0.95rem; }
.header-actions { display: flex; gap: 1rem; }
.action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.5); color: #667eea; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease; }
.action-btn:hover:not(:disabled) { background: rgba(102, 126, 234, 0.3); border-color: rgba(102, 126, 234, 0.8); transform: translateY(-2px); }
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.chart-placeholder { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); }
.chart-title { font-size: 1.125rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; }
.chart-area { height: 250px; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.2); border-radius: 0.5rem; }
.chart-svg { color: #9ca3af; width: 100%; height: 100%; }
.recent-matches-section { margin-bottom: 2rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
.view-all-link { color: #667eea; text-decoration: none; font-size: 0.875rem; font-weight: 600; transition: color 0.3s ease; }
.view-all-link:hover { color: #764ba2; }
.user-badge { display: inline-block; padding: 0.25rem 0.75rem; background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.5); border-radius: 0.375rem; color: #667eea; font-size: 0.875rem; font-weight: 500; }
.reward-badge { display: inline-block; padding: 0.25rem 0.75rem; background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.5); border-radius: 0.375rem; color: #86efac; font-size: 0.875rem; font-weight: 600; }
.status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.status-completed { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.status-pending { background: rgba(251, 146, 60, 0.2); color: #fed7aa; }
.status-cancelled { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.quick-actions-section { margin-bottom: 2rem; }
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
.quick-action-btn { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; color: #d1d5db; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
.quick-action-btn:hover { transform: translateY(-4px); background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%); border-color: rgba(102, 126, 234, 0.5); color: #667eea; }
.quick-action-btn svg { width: 2rem; height: 2rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: linear-gradient(135deg, #2a2a3e 0%, #3d2863 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.modal-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
.modal-close { background: rgba(255, 255, 255, 0.1); border: none; border-radius: 0.375rem; color: #9ca3af; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; }
.modal-close:hover { background: rgba(255, 255, 255, 0.15); color: #ffffff; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 1rem; justify-content: flex-end; }
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; margin-bottom: 0.5rem; color: #ffffff; font-weight: 500; font-size: 0.875rem; }
.form-textarea, .form-select { width: 100%; padding: 0.625rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-family: inherit; font-size: 0.875rem; transition: all 0.3s ease; }
.form-textarea:focus, .form-select:focus { outline: none; background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); box-shadow: 0 0 10px rgba(102, 126, 234, 0.2); }
.btn-primary, .btn-secondary { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
.btn-secondary { background: rgba(255, 255, 255, 0.1); color: #d1d5db; border: 1px solid rgba(255, 255, 255, 0.1); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.2); }
</style>
