<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Content Moderation</h1>
        <button @click="showBannedWordsEditor = true" class="btn-edit">Edit Banned Words</button>
      </div>

      <!-- Reported Content List -->
      <div class="content-section">
        <h2 class="section-title">Reported Content</h2>
        <div class="reports-list">
          <div v-for="report in reports" :key="report.id" class="report-card">
            <div class="report-header">
              <div>
                <p class="report-user">{{ report.reportedUser }}</p>
                <p class="report-date">{{ report.date }}</p>
              </div>
              <span class="report-severity" :class="`severity-${report.severity.toLowerCase()}`">{{ report.severity }}</span>
            </div>
            <p class="report-reason"><strong>Reason:</strong> {{ report.reason }}</p>
            <p class="report-content">{{ report.content }}</p>
            <div class="report-actions">
              <button @click="dismissReport(report.id)" class="action-btn dismiss">Dismiss</button>
              <button @click="deleteContent(report.id)" class="action-btn delete">Delete</button>
              <button @click="warnUser(report.id)" class="action-btn warn">Warn User</button>
              <button @click="showBanConfirm(report.id)" class="action-btn ban">Ban User</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Banned Words Editor Modal -->
      <div v-if="showBannedWordsEditor" class="modal-overlay" @click="showBannedWordsEditor = false">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Edit Banned Words</h3>
            <button @click="showBannedWordsEditor = false" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="hint-text">Enter one word per line. Words will be auto-saved.</p>
            <textarea v-model="bannedWords" class="banned-words-textarea" placeholder="badword1&#10;badword2&#10;badword3"></textarea>
          </div>
          <div class="modal-footer">
            <button @click="showBannedWordsEditor = false" class="btn-secondary">Close</button>
          </div>
        </div>
      </div>

      <!-- Ban Confirmation Modal -->
      <div v-if="showBanConfirmModal" class="modal-overlay" @click="showBanConfirmModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Confirm Ban</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to ban this user?</p>
            <p class="warning">This action can be reversed from the Users panel.</p>
          </div>
          <div class="modal-footer">
            <button @click="showBanConfirmModal = false" class="btn-secondary">Cancel</button>
            <button @click="confirmBan" class="btn-danger">Confirm Ban</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'

const showBannedWordsEditor = ref(false)
const showBanConfirmModal = ref(false)
const selectedReportId = ref(null)

const bannedWords = ref('badword1\nbadword2\nbadword3\noffensive\ninappropriate')

const reports = ref([
  { id: 1, reportedUser: 'player_123', reason: 'Harassment', severity: 'High', content: 'Abusive language in chat', date: '2024-01-15 14:30' },
  { id: 2, reportedUser: 'player_456', reason: 'Spam', severity: 'Medium', content: 'Repeated promotional links', date: '2024-01-15 13:45' },
  { id: 3, reportedUser: 'player_789', reason: 'Offensive Content', severity: 'High', content: 'Discriminatory remarks', date: '2024-01-15 13:20' },
  { id: 4, reportedUser: 'player_012', reason: 'Cheating', severity: 'Critical', content: 'Suspected use of bots', date: '2024-01-15 12:15' }
])

const dismissReport = (id) => {
  reports.value = reports.value.filter(r => r.id !== id)
}

const deleteContent = (id) => {
  console.log('Content deleted:', id)
  reports.value = reports.value.filter(r => r.id !== id)
}

const warnUser = (id) => {
  console.log('User warned for report:', id)
}

const showBanConfirm = (id) => {
  selectedReportId.value = id
  showBanConfirmModal.value = true
}

const confirmBan = () => {
  console.log('User banned:', selectedReportId.value)
  reports.value = reports.value.filter(r => r.id !== selectedReportId.value)
  showBanConfirmModal.value = false
}
</script>

<style scoped>
.admin-page { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.page-content { flex: 1; overflow-y: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; }
.btn-edit { padding: 0.625rem 1rem; background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.5); color: #667eea; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.btn-edit:hover { background: rgba(102, 126, 234, 0.3); }
.content-section { margin-bottom: 2rem; }
.section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; }
.reports-list { display: flex; flex-direction: column; gap: 1rem; }
.report-card { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); }
.report-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; }
.report-user { color: #ffffff; font-weight: 600; margin: 0; }
.report-date { color: #9ca3af; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
.report-severity { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.severity-low { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.severity-medium { background: rgba(251, 146, 60, 0.2); color: #fed7aa; }
.severity-high { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.severity-critical { background: rgba(139, 0, 0, 0.3); color: #ff6b6b; }
.report-reason, .report-content { color: #d1d5db; margin: 0.5rem 0; }
.report-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.action-btn { padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05); color: #d1d5db; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; }
.action-btn:hover { background: rgba(255, 255, 255, 0.08); }
.action-btn.delete { border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; }
.action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); }
.action-btn.warn { border-color: rgba(251, 146, 60, 0.3); color: #fed7aa; }
.action-btn.warn:hover { background: rgba(251, 146, 60, 0.2); }
.action-btn.ban { border-color: rgba(139, 0, 0, 0.3); color: #ff6b6b; }
.action-btn.ban:hover { background: rgba(139, 0, 0, 0.2); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: linear-gradient(135deg, #2a2a3e 0%, #3d2863 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; width: 90%; max-width: 500px; }
.modal-content.large { max-width: 700px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.modal-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0; }
.modal-close { background: rgba(255, 255, 255, 0.1); border: none; border-radius: 0.375rem; color: #9ca3af; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.hint-text { color: #9ca3af; font-size: 0.875rem; margin: 0 0 1rem 0; }
.banned-words-textarea { width: 100%; height: 300px; padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-family: monospace; font-size: 0.875rem; resize: vertical; }
.banned-words-textarea:focus { outline: none; background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); }
.warning { color: #fca5a5; font-size: 0.875rem; margin-top: 1rem; }
.modal-footer { padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 1rem; justify-content: flex-end; }
.btn-secondary { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.1); color: #d1d5db; cursor: pointer; font-weight: 600; }
.btn-danger { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; cursor: pointer; font-weight: 600; }
</style>
