<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Shop Manager</h1>
        <button @click="showAddItemModal = true" class="btn-add">+ Add Item</button>
      </div>

      <!-- Shop Items Grid -->
      <div class="items-grid">
        <div v-for="item in shopItems" :key="item.id" class="item-card">
          <div class="item-header">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-actions">
              <button @click="editItem(item)" class="action-icon edit">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button @click="deleteItem(item.id)" class="action-icon delete">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="item-details">
            <p><span class="label">Type:</span> {{ item.type }}</p>
            <p><span class="label">Category:</span> {{ item.category }}</p>
            <p><span class="label">Price:</span> {{ item.price }} {{ item.currency }}</p>
            <p><span class="label">Unlock:</span> {{ item.unlockCondition }}</p>
          </div>
          <div class="item-footer">
            <button :class="['toggle-btn', item.enabled ? 'enabled' : 'disabled']" @click="toggleItem(item.id)">
              {{ item.enabled ? 'Enabled' : 'Disabled' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Item Modal -->
      <div v-if="showAddItemModal" class="modal-overlay" @click="showAddItemModal = false">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h3>
            <button @click="showAddItemModal = false" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <input v-model="itemForm.name" type="text" placeholder="Item Name" class="form-input" />
              <select v-model="itemForm.type" class="form-input">
                <option value="">Select Type</option>
                <option value="consumable">Consumable</option>
                <option value="cosmetic">Cosmetic</option>
                <option value="power">Power-up</option>
              </select>
              <select v-model="itemForm.category" class="form-input">
                <option value="">Select Category</option>
                <option value="avatar">Avatar</option>
                <option value="board">Board</option>
                <option value="effect">Effect</option>
              </select>
              <input v-model.number="itemForm.price" type="number" placeholder="Price" class="form-input" />
              <select v-model="itemForm.currency" class="form-input">
                <option value="koin">Koin</option>
                <option value="diamond">Diamond</option>
              </select>
              <input v-model="itemForm.unlockCondition" type="text" placeholder="Unlock Condition" class="form-input" />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAddItemModal = false" class="btn-secondary">Cancel</button>
            <button @click="saveItem" class="btn-primary">Save Item</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'

const showAddItemModal = ref(false)
const editingItem = ref(null)

const itemForm = reactive({
  name: '',
  type: '',
  category: '',
  price: 0,
  currency: 'koin',
  unlockCondition: ''
})

const shopItems = ref([
  { id: 1, name: 'Gold Avatar', type: 'cosmetic', category: 'avatar', price: 500, currency: 'koin', unlockCondition: 'ELO > 1800', enabled: true },
  { id: 2, name: 'Premium Board', type: 'cosmetic', category: 'board', price: 100, currency: 'diamond', unlockCondition: 'None', enabled: true },
  { id: 3, name: 'Victory Effect', type: 'power', category: 'effect', price: 250, currency: 'koin', unlockCondition: '10 Wins', enabled: false },
  { id: 4, name: 'Speed Boost', type: 'consumable', category: 'power', price: 50, currency: 'koin', unlockCondition: 'None', enabled: true },
  { id: 5, name: 'Mystic Avatar', type: 'cosmetic', category: 'avatar', price: 75, currency: 'diamond', unlockCondition: 'VIP Only', enabled: true }
])

const editItem = (item) => {
  editingItem.value = item
  itemForm.name = item.name
  itemForm.type = item.type
  itemForm.category = item.category
  itemForm.price = item.price
  itemForm.currency = item.currency
  itemForm.unlockCondition = item.unlockCondition
  showAddItemModal.value = true
}

const saveItem = () => {
  if (editingItem.value) {
    const idx = shopItems.value.findIndex(i => i.id === editingItem.value.id)
    shopItems.value[idx] = { ...editingItem.value, ...itemForm }
  } else {
    shopItems.value.push({
      id: Math.max(...shopItems.value.map(i => i.id), 0) + 1,
      ...itemForm,
      enabled: true
    })
  }
  showAddItemModal.value = false
  editingItem.value = null
  Object.keys(itemForm).forEach(key => itemForm[key] = key === 'currency' ? 'koin' : key === 'price' ? 0 : '')
}

const deleteItem = (id) => {
  shopItems.value = shopItems.value.filter(item => item.id !== id)
}

const toggleItem = (id) => {
  const item = shopItems.value.find(i => i.id === id)
  if (item) item.enabled = !item.enabled
}
</script>

<style scoped>
.admin-page { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.page-content { flex: 1; overflow-y: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; }
.btn-add { padding: 0.625rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.item-card { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); transition: all 0.3s ease; }
.item-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.2); }
.item-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; }
.item-name { font-size: 1.125rem; font-weight: 600; color: #ffffff; margin: 0; }
.item-actions { display: flex; gap: 0.5rem; }
.action-icon { width: 2rem; height: 2rem; padding: 0; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 0.375rem; color: #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.action-icon:hover { background: rgba(255, 255, 255, 0.15); }
.action-icon.delete:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.item-details { margin: 1rem 0; font-size: 0.875rem; color: #d1d5db; }
.item-details p { margin: 0.5rem 0; }
.label { color: #9ca3af; font-weight: 500; }
.item-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.toggle-btn { width: 100%; padding: 0.5rem; border-radius: 0.375rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05); color: #d1d5db; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.toggle-btn.enabled { background: rgba(34, 197, 94, 0.2); color: #86efac; border-color: rgba(34, 197, 94, 0.5); }
.toggle-btn.disabled { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.5); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: linear-gradient(135deg, #2a2a3e 0%, #3d2863 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; width: 90%; max-width: 500px; }
.modal-content.large { max-width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.modal-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0; }
.modal-close { background: rgba(255, 255, 255, 0.1); border: none; border-radius: 0.375rem; color: #9ca3af; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-input { padding: 0.625rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-family: inherit; font-size: 0.875rem; }
.form-input:focus { outline: none; background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); }
.modal-footer { padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 1rem; justify-content: flex-end; }
.btn-secondary { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.1); color: #d1d5db; cursor: pointer; font-weight: 600; }
.btn-primary { padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; font-weight: 600; }
</style>
