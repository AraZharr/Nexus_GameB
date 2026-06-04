<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Economy Monitor</h1>
        <button @click="exportCSV" class="export-btn">Export CSV</button>
      </div>

      <!-- Economy Stats -->
      <div class="stats-row">
        <div class="stat-box">
          <p class="stat-label">Total Koin in Circulation</p>
          <p class="stat-value">{{ totalKoin.toLocaleString() }}</p>
        </div>
        <div class="stat-box">
          <p class="stat-label">Total Diamond in Circulation</p>
          <p class="stat-value">{{ totalDiamond.toLocaleString() }}</p>
        </div>
        <div class="stat-box">
          <p class="stat-label">Daily Revenue</p>
          <p class="stat-value">${{ dailyRevenue.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <select v-model="filterCurrency" class="filter-select">
          <option value="">All Currencies</option>
          <option value="koin">Koin</option>
          <option value="diamond">Diamond</option>
        </select>
        <select v-model="filterReason" class="filter-select">
          <option value="">All Reasons</option>
          <option value="match_reward">Match Reward</option>
          <option value="purchase">Purchase</option>
          <option value="refund">Refund</option>
          <option value="admin_adjustment">Admin Adjustment</option>
        </select>
      </div>

      <!-- Transaction Log -->
      <DataTable
        :columns="transactionColumns"
        :data="filteredTransactions"
        :searchable="true"
        :page-size="20"
      >
        <template #cell-type="{ value }">
          <span class="type-badge" :class="`type-${value.toLowerCase()}`">{{ value }}</span>
        </template>
        <template #cell-currency="{ value }">
          <span class="currency-badge">{{ value }}</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="amount-text" :class="value > 0 ? 'positive' : 'negative'">
            {{ value > 0 ? '+' : '' }}{{ value }}
          </span>
        </template>
      </DataTable>

      <!-- Balance Adjustment Form -->
      <div class="adjustment-section">
        <h3 class="section-title">Balance Adjustment</h3>
        <div class="adjustment-form">
          <input v-model="adjustmentUserId" type="text" placeholder="User ID" class="form-input" />
          <select v-model="adjustmentCurrency" class="form-input">
            <option value="koin">Koin</option>
            <option value="diamond">Diamond</option>
          </select>
          <input v-model.number="adjustmentAmount" type="number" placeholder="Amount" class="form-input" />
          <textarea v-model="adjustmentReason" placeholder="Reason for adjustment" class="form-input" rows="3"></textarea>
          <button @click="submitAdjustment" class="btn-primary">Submit Adjustment</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import DataTable from '../../components/admin/DataTable.vue'

const filterCurrency = ref('')
const filterReason = ref('')
const adjustmentUserId = ref('')
const adjustmentCurrency = ref('koin')
const adjustmentAmount = ref(0)
const adjustmentReason = ref('')

const transactionColumns = [
  { key: 'id', label: 'Transaction ID', sortable: true },
  { key: 'userId', label: 'User ID', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'currency', label: 'Currency', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'reason', label: 'Reason', sortable: true },
  { key: 'timestamp', label: 'Date', sortable: true }
]

const transactions = [
  { id: 'txn_001', userId: 'user_001', type: 'Credit', currency: 'Koin', amount: 100, reason: 'Match Reward', timestamp: '2024-01-15 14:30' },
  { id: 'txn_002', userId: 'user_002', type: 'Debit', currency: 'Diamond', amount: -50, reason: 'Purchase', timestamp: '2024-01-15 14:25' },
  { id: 'txn_003', userId: 'user_003', type: 'Credit', currency: 'Koin', amount: 500, reason: 'Admin Adjustment', timestamp: '2024-01-15 14:20' },
  { id: 'txn_004', userId: 'user_004', type: 'Debit', currency: 'Koin', amount: -250, reason: 'Refund', timestamp: '2024-01-15 14:15' },
  { id: 'txn_005', userId: 'user_005', type: 'Credit', currency: 'Diamond', amount: 100, reason: 'Match Reward', timestamp: '2024-01-15 14:10' },
  { id: 'txn_006', userId: 'user_006', type: 'Credit', currency: 'Koin', amount: 200, reason: 'Match Reward', timestamp: '2024-01-15 14:05' },
  { id: 'txn_007', userId: 'user_007', type: 'Debit', currency: 'Diamond', amount: -1000, reason: 'Purchase', timestamp: '2024-01-15 14:00' }
]

const filteredTransactions = computed(() => {
  return transactions.filter(t => {
    const currencyMatch = !filterCurrency.value || t.currency.toLowerCase() === filterCurrency.value
    const reasonMatch = !filterReason.value || t.reason.toLowerCase().includes(filterReason.value)
    return currencyMatch && reasonMatch
  })
})

const totalKoin = computed(() => {
  return transactions
    .filter(t => t.currency === 'Koin')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalDiamond = computed(() => {
  return transactions
    .filter(t => t.currency === 'Diamond')
    .reduce((sum, t) => sum + t.amount, 0)
})

const dailyRevenue = ref(2345.67)

const exportCSV = () => {
  let csv = 'Transaction ID,User ID,Type,Currency,Amount,Reason,Date\n'
  filteredTransactions.forEach(t => {
    csv += `${t.id},${t.userId},${t.type},${t.currency},${t.amount},${t.reason},${t.timestamp}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
}

const submitAdjustment = () => {
  console.log('Adjustment submitted:', {
    userId: adjustmentUserId.value,
    currency: adjustmentCurrency.value,
    amount: adjustmentAmount.value,
    reason: adjustmentReason.value
  })
  adjustmentUserId.value = ''
  adjustmentAmount.value = 0
  adjustmentReason.value = ''
}
</script>

<style scoped>
.admin-page { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.page-content { flex: 1; overflow-y: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; }
.export-btn { padding: 0.625rem 1rem; background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.5); color: #86efac; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.export-btn:hover { background: rgba(34, 197, 94, 0.3); }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-box { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); }
.stat-label { color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.5rem; }
.stat-value { font-size: 1.875rem; font-weight: 700; color: #ffffff; }
.filters-section { display: flex; gap: 1rem; margin-bottom: 2rem; }
.filter-select { padding: 0.625rem 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-size: 0.875rem; cursor: pointer; }
.type-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; }
.type-credit { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.type-debit { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.currency-badge { display: inline-block; padding: 0.25rem 0.75rem; background: rgba(102, 126, 234, 0.2); color: #a5b4fc; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; }
.amount-text { font-weight: 600; }
.amount-text.positive { color: #86efac; }
.amount-text.negative { color: #fca5a5; }
.adjustment-section { margin-top: 3rem; padding: 2rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); }
.section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; }
.adjustment-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.form-input { padding: 0.625rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-family: inherit; font-size: 0.875rem; }
.form-input:focus { outline: none; background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); }
.form-input[type="textarea"], textarea { grid-column: 1 / -1; }
.btn-primary { grid-column: 1 / -1; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
</style>
