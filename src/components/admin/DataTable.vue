<template>
  <div class="data-table-container">
    <!-- Header with search and controls -->
    <div class="table-header">
      <div v-if="searchable" class="search-box">
        <svg
          class="search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
        />
      </div>
      <slot name="header-actions"></slot>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="skeleton-loader">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div
          v-for="j in columns.length"
          :key="j"
          class="skeleton-cell"
        ></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredData.length === 0" class="empty-state">
      <svg
        class="empty-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        ></path>
      </svg>
      <p class="empty-message">{{ emptyMessage }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ sortable: column.sortable !== false }"
            >
              <div class="th-content">
                {{ column.label }}
                <svg
                  v-if="column.sortable !== false"
                  class="sort-icon"
                  :class="{ active: sortKey === column.key }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4"
                  ></path>
                </svg>
              </div>
            </th>
            <th v-if="hasActions" class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedData"
            :key="index"
            class="data-row"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="data-cell"
            >
              <slot
                :name="`cell-${column.key}`"
                :value="item[column.key]"
                :item="item"
              >
                {{ formatCellValue(item[column.key]) }}
              </slot>
            </td>
            <td v-if="hasActions" class="actions-cell">
              <div class="actions-group">
                <slot
                  name="row-actions"
                  :item="item"
                  :index="index"
                >
                  <button
                    v-for="action in rowActions"
                    :key="action.id"
                    @click="action.handler(item)"
                    :class="[
                      'action-btn',
                      `action-${action.id}`,
                      `variant-${action.variant || 'default'}`
                    ]"
                    :title="action.label"
                  >
                    {{ action.label }}
                  </button>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && filteredData.length > pageSize" class="pagination">
      <button
        @click="previousPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <div class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    validator: (arr) => arr.every(col => col.key && col.label)
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  emptyMessage: {
    type: String,
    default: 'No data available'
  },
  rowActions: {
    type: Array,
    default: () => [],
    validator: (arr) => arr.every(action => action.id && action.label && action.handler)
  }
})

const emit = defineEmits(['action', 'sort', 'search'])

const searchQuery = ref('')
const currentPage = ref(1)
const sortKey = ref(null)
const sortDirection = ref('asc')

const filteredData = computed(() => {
  let filtered = [...props.data]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      props.columns.some(col =>
        String(item[col.key]).toLowerCase().includes(query)
      )
    )
    emit('search', searchQuery.value)
  }

  if (sortKey.value) {
    filtered.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (sortDirection.value === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }

  return filtered
})

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / props.pageSize)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredData.value.slice(start, end)
})

const hasActions = computed(() => props.rowActions.length > 0)

const sortBy = (key) => {
  const column = props.columns.find(col => col.key === key)
  if (column?.sortable === false) return

  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  emit('sort', { key, direction: sortDirection.value })
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const formatCellValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}
</script>

<style scoped>
.data-table-container {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.table-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.2);
}

.search-input::placeholder {
  color: #9ca3af;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #9ca3af;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
}

.data-table th.sortable {
  cursor: pointer;
  transition: color 0.3s ease;
}

.data-table th.sortable:hover {
  color: #667eea;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.sort-icon.active {
  opacity: 1;
  color: #667eea;
}

.data-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.data-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.1);
}

.data-table td {
  padding: 1rem;
  color: #d1d5db;
  font-size: 0.875rem;
}

.actions-header {
  text-align: right;
  padding-right: 2rem;
}

.actions-cell {
  text-align: right;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.action-btn.variant-danger {
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.action-btn.variant-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
}

.action-btn.variant-success {
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.action-btn.variant-success:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.6);
}

.skeleton-loader {
  padding: 1rem;
}

.skeleton-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-cell {
  flex: 1;
  height: 1rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
  background-size: 200% 100%;
  border-radius: 0.375rem;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-message {
  font-size: 0.875rem;
}

.pagination {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pagination-btn {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 1rem;
  height: 1rem;
}

.pagination-info {
  color: #9ca3af;
  font-size: 0.875rem;
  min-width: 150px;
  text-align: center;
}
</style>
