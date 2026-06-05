<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">User Management</h1>
        <div class="filter-controls">
          <select v-model="filterRole" class="filter-select">
            <option value="">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <select v-model="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <button @click="fetchUsers" class="refresh-btn" :disabled="loading">
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-banner">{{ error }}</div>

      <!-- Success -->
      <div v-if="successMsg" class="success-banner" @click="successMsg = ''">{{ successMsg }}</div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>ELO Chess</th>
              <th>Koin</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-8 text-slate-400">Loading users...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="7" class="text-center py-8 text-slate-400">No users found</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="font-medium">{{ user.display_name || 'Unnamed' }}</td>
              <td class="text-slate-400">{{ user.email || '-' }}</td>
              <td>
                <span class="role-badge" :class="roleColors[user.role] || 'role-default'">
                  {{ roleLabels[user.role] || user.role }}
                </span>
              </td>
              <td>{{ user.elo_chess }}</td>
              <td class="text-yellow-400">{{ user.koin?.toLocaleString() }}</td>
              <td>
                <span class="status-dot" :class="user.banned ? 'status-banned' : 'status-active'"></span>
                {{ user.banned ? 'Banned' : 'Active' }}
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="rbac.canAssignRole(user.role)"
                    @click="openRoleModal(user)"
                    class="action-btn role-btn"
                  >
                    Change Role
                  </button>
                  <button
                    v-if="rbac.canBanUsers.value && user.id !== authStore.user?.id"
                    @click="toggleBan(user)"
                    class="action-btn"
                    :class="user.banned ? 'unban-btn' : 'ban-btn'"
                  >
                    {{ user.banned ? 'Unban' : 'Ban' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Role Change Modal -->
      <div v-if="showRoleModal" class="modal-overlay" @click="closeRoleModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Change Role</h3>
            <button @click="closeRoleModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p class="mb-4">
              Change role for <strong>{{ roleModalUser?.display_name }}</strong>
            </p>
            <p class="text-sm text-slate-400 mb-4">
              Current role: <span class="role-badge" :class="roleColors[roleModalUser?.role]">{{ roleLabels[roleModalUser?.role] }}</span>
            </p>
            <div class="role-options">
              <label
                v-for="role in rbac.assignableRoles.value"
                :key="role"
                class="role-option"
                :class="{ 'role-selected': selectedRole === role }"
              >
                <input
                  type="radio"
                  :value="role"
                  v-model="selectedRole"
                  class="hidden"
                />
                <span class="role-badge" :class="roleColors[role]">{{ roleLabels[role] }}</span>
                <span class="text-xs text-slate-400 ml-2">Level {{ roleLevels[role] }}</span>
              </label>
            </div>
            <p v-if="roleError" class="text-red-400 text-sm mt-3">{{ roleError }}</p>
          </div>
          <div class="modal-footer">
            <button @click="closeRoleModal" class="btn-secondary">Cancel</button>
            <button
              @click="confirmRoleChange"
              class="btn-primary"
              :disabled="!selectedRole || selectedRole === roleModalUser?.role || promoting"
            >
              {{ promoting ? 'Updating...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Ban Confirmation Modal -->
      <div v-if="showBanModal" class="modal-overlay" @click="showBanModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ banTarget.banned ? 'Unban' : 'Ban' }} User</h3>
            <button @click="showBanModal = false" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p v-if="!banTarget.banned">
              Are you sure you want to ban <strong>{{ banTarget.display_name }}</strong>?
            </p>
            <p v-else>
              Are you sure you want to unban <strong>{{ banTarget.display_name }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button @click="showBanModal = false" class="btn-secondary">Cancel</button>
            <button @click="confirmBan" class="btn-danger">
              {{ banTarget.banned ? 'Unban' : 'Ban' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRBAC } from '@/composables/useRBAC'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'

const authStore = useAuthStore()
const rbac = useRBAC()

const roleLabels = rbac.ROLE_LABELS
const roleColors = rbac.ROLE_COLORS
const roleLevels = rbac.ROLE_LEVELS

const loading = ref(false)
const error = ref('')
const successMsg = ref('')
const users = ref([])
const filterRole = ref('')
const filterStatus = ref('')

// Role modal
const showRoleModal = ref(false)
const roleModalUser = ref(null)
const selectedRole = ref('')
const promoting = ref(false)
const roleError = ref('')

// Ban modal
const showBanModal = ref(false)
const banTarget = ref({})

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const roleMatch = !filterRole.value || u.role === filterRole.value
    const statusMatch =
      !filterStatus.value ||
      (filterStatus.value === 'banned' ? u.banned : !u.banned)
    return roleMatch && statusMatch
  })
})

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data, err } = await supabase
      .from('users')
      .select('id, display_name, email, role, elo_chess, koin, diamond, banned, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (err) throw err
    users.value = data || []
  } catch (e) {
    error.value = e.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

const openRoleModal = (user) => {
  roleModalUser.value = user
  selectedRole.value = user.role
  roleError.value = ''
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  roleModalUser.value = null
  selectedRole.value = ''
  roleError.value = ''
}

const confirmRoleChange = async () => {
  if (!selectedRole.value || !roleModalUser.value) return
  if (selectedRole.value === roleModalUser.value.role) return

  promoting.value = true
  roleError.value = ''

  const result = await rbac.promoteUser(roleModalUser.value.id, selectedRole.value)

  if (result.success) {
    // Update local state
    const idx = users.value.findIndex((u) => u.id === roleModalUser.value.id)
    if (idx >= 0) users.value[idx].role = selectedRole.value
    closeRoleModal()
    successMsg.value = result.message
    setTimeout(() => (successMsg.value = ''), 4000)
  } else {
    roleError.value = result.message
  }

  promoting.value = false
}

const toggleBan = (user) => {
  banTarget.value = user
  showBanModal.value = true
}

const confirmBan = async () => {
  const newBanned = !banTarget.value.banned
  try {
    const { err } = await supabase
      .from('users')
      .update({ banned: newBanned })
      .eq('id', banTarget.value.id)

    if (err) throw err

    const idx = users.value.findIndex((u) => u.id === banTarget.value.id)
    if (idx >= 0) users.value[idx].banned = newBanned

    successMsg.value = `${banTarget.value.display_name} ${newBanned ? 'banned' : 'unbanned'} successfully`
    setTimeout(() => (successMsg.value = ''), 4000)
  } catch (e) {
    error.value = e.message || 'Failed to update ban status'
  }

  showBanModal.value = false
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%);
}
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
.page-header {
  margin-bottom: 2rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}
.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.filter-select {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
}
.filter-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
}
.refresh-btn {
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 0.5rem;
  color: #667eea;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}
.refresh-btn:disabled {
  opacity: 0.5;
}
.error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.success-banner {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: #86efac;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  cursor: pointer;
}
.table-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.data-table td {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #d1d5db;
}
.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.role-default {
  background: rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
}
.status-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.status-active {
  background: #22c55e;
}
.status-banned {
  background: #ef4444;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.role-btn {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(102, 126, 234, 0.3);
}
.role-btn:hover {
  background: rgba(102, 126, 234, 0.3);
}
.ban-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.ban-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}
.unban-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.unban-btn:hover {
  background: rgba(34, 197, 94, 0.3);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}
.modal-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}
.modal-body {
  padding: 1.5rem;
  color: #d1d5db;
}
.role-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.role-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}
.role-option:hover {
  background: rgba(255, 255, 255, 0.05);
}
.role-selected {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}
.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.btn-secondary,
.btn-primary,
.btn-danger {
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}
.btn-primary {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}
.btn-primary:disabled {
  opacity: 0.5;
}
.btn-danger {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}
</style>
