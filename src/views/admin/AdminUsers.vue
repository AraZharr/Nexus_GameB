<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">User Management</h1>
        <div class="filter-controls">
          <select v-model="filterRole" class="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <select v-model="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <DataTable
        :columns="userColumns"
        :data="filteredUsers"
        :searchable="true"
        :page-size="15"
        :row-actions="userActions"
      >
        <template #cell-role="{ value }">
          <span class="role-badge" :class="`role-${value.toLowerCase()}`">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <span class="status-indicator" :class="`status-${value.toLowerCase()}`">{{ value }}</span>
        </template>
      </DataTable>

      <!-- Ban Confirmation Modal -->
      <div v-if="showBanModal" class="modal-overlay" @click="showBanModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Confirm Ban User</h3>
            <button @click="showBanModal = false" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to ban <strong>{{ banUserName }}</strong>?</p>
            <p class="warning-text">This action can be reversed by unbanning the user.</p>
          </div>
          <div class="modal-footer">
            <button @click="showBanModal = false" class="btn-secondary">Cancel</button>
            <button @click="confirmBan" class="btn-danger">Confirm Ban</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import DataTable from '../../components/admin/DataTable.vue'

const filterRole = ref('')
const filterStatus = ref('')
const showBanModal = ref(false)
const banUserName = ref('')
const banUserId = ref('')

const userColumns = [
  { key: 'uid', label: 'UID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'elo', label: 'ELO Chess', sortable: true },
  { key: 'koin', label: 'Koin', sortable: true },
  { key: 'diamond', label: 'Diamond', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

const allUsers = [
  { uid: 'user_001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', elo: 2100, koin: 5000, diamond: 100, status: 'Active' },
  { uid: 'user_002', name: 'Bob Smith', email: 'bob@example.com', role: 'User', elo: 1800, koin: 3200, diamond: 50, status: 'Active' },
  { uid: 'user_003', name: 'Carol White', email: 'carol@example.com', role: 'Moderator', elo: 1950, koin: 4100, diamond: 75, status: 'Active' },
  { uid: 'user_004', name: 'David Brown', email: 'david@example.com', role: 'User', elo: 1600, koin: 2100, diamond: 25, status: 'Inactive' },
  { uid: 'user_005', name: 'Eve Davis', email: 'eve@example.com', role: 'User', elo: 1700, koin: 2800, diamond: 40, status: 'Banned' },
  { uid: 'user_006', name: 'Frank Miller', email: 'frank@example.com', role: 'User', elo: 1550, koin: 1900, diamond: 20, status: 'Active' },
  { uid: 'user_007', name: 'Grace Wilson', email: 'grace@example.com', role: 'User', elo: 2000, koin: 6000, diamond: 150, status: 'Active' }
]

const filteredUsers = computed(() => {
  return allUsers.filter(user => {
    const roleMatch = !filterRole.value || user.role.toLowerCase() === filterRole.value
    const statusMatch = !filterStatus.value || user.status.toLowerCase() === filterStatus.value
    return roleMatch && statusMatch
  })
})

const userActions = [
  {
    id: 'profile',
    label: 'View Profile',
    handler: (item) => console.log('View profile:', item)
  },
  {
    id: 'ban',
    label: 'Ban',
    variant: 'danger',
    handler: (item) => {
      banUserName.value = item.name
      banUserId.value = item.uid
      showBanModal.value = true
    }
  },
  {
    id: 'edit',
    label: 'Edit Role',
    handler: (item) => console.log('Edit role:', item)
  },
  {
    id: 'push',
    label: 'Send Push',
    handler: (item) => console.log('Send FCM push:', item)
  }
]

const confirmBan = () => {
  console.log('Banning user:', banUserId.value)
  showBanModal.value = false
}
</script>

<style scoped>
.admin-page { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.page-content { flex: 1; overflow-y: auto; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 1.5rem; }
.filter-controls { display: flex; gap: 1rem; }
.filter-select { padding: 0.625rem 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-size: 0.875rem; cursor: pointer; transition: all 0.3s ease; }
.filter-select:hover, .filter-select:focus { background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); outline: none; }
.role-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.role-admin { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.role-moderator { background: rgba(251, 146, 60, 0.2); color: #fed7aa; }
.role-user { background: rgba(102, 126, 234, 0.2); color: #a5b4fc; }
.status-indicator { display: inline-block; width: 0.75rem; height: 0.75rem; border-radius: 50%; margin-right: 0.5rem; }
.status-active { background: #22c55e; }
.status-inactive { background: #ef9a00; }
.status-banned { background: #ef4444; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: linear-gradient(135deg, #2a2a3e 0%, #3d2863 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; width: 90%; max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.modal-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
.modal-close { background: rgba(255, 255, 255, 0.1); border: none; border-radius: 0.375rem; color: #9ca3af; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal-body { padding: 1.5rem; color: #d1d5db; }
.warning-text { font-size: 0.875rem; color: #9ca3af; margin-top: 0.75rem; }
.modal-footer { padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 1rem; justify-content: flex-end; }
.btn-secondary, .btn-danger { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-secondary { background: rgba(255, 255, 255, 0.1); color: #d1d5db; }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
.btn-danger { background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; }
.btn-danger:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3); }
</style>
