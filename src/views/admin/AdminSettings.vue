<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="page-content">
      <h1 class="page-title">System Settings</h1>

      <!-- Maintenance Mode -->
      <div class="settings-section">
        <h2 class="section-title">Maintenance Mode</h2>
        <div class="setting-card">
          <div class="setting-control">
            <label class="switch">
              <input v-model="settings.maintenanceMode" type="checkbox" />
              <span class="slider"></span>
            </label>
            <p class="control-label">Enable Maintenance Mode</p>
          </div>
          <textarea v-model="settings.maintenanceMessage" class="form-textarea" placeholder="Maintenance message..."></textarea>
        </div>
      </div>

      <!-- Global Announcement -->
      <div class="settings-section">
        <h2 class="section-title">Global Announcement</h2>
        <div class="setting-card">
          <textarea v-model="settings.announcement" class="form-textarea" placeholder="Enter announcement message..."></textarea>
          <button @click="broadcastAnnouncement" class="btn-primary">Broadcast</button>
        </div>
      </div>

      <!-- Game Configuration -->
      <div class="settings-section">
        <h2 class="section-title">Game Configuration</h2>
        <div class="setting-card">
          <div class="form-group">
            <label class="form-label">Move Timer (seconds)</label>
            <input v-model.number="settings.moveTimer" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Kill Rules</label>
            <select v-model="settings.killRules" class="form-input">
              <option value="standard">Standard</option>
              <option value="blitz">Blitz</option>
              <option value="rapid">Rapid</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Betting Configuration -->
      <div class="settings-section">
        <h2 class="section-title">Betting Configuration</h2>
        <div class="setting-card">
          <div class="form-group">
            <label class="form-label">Min Bet (Koin)</label>
            <input v-model.number="settings.bettingMin" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Bet (Koin)</label>
            <input v-model.number="settings.bettingMax" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">House Fee (%)</label>
            <input v-model.number="settings.houseFee" type="number" step="0.1" class="form-input" />
          </div>
          <div class="setting-control">
            <label class="switch">
              <input v-model="settings.bettingEnabled" type="checkbox" />
              <span class="slider"></span>
            </label>
            <p class="control-label">Enable Betting Globally</p>
          </div>
        </div>
      </div>

      <!-- Skill Configuration -->
      <div class="settings-section">
        <h2 class="section-title">Skill Configuration</h2>
        <div class="setting-card">
          <div class="setting-control">
            <label class="switch">
              <input v-model="settings.skillsEnabled" type="checkbox" />
              <span class="slider"></span>
            </label>
            <p class="control-label">Enable Skills Globally</p>
          </div>
          <div class="form-group">
            <label class="form-label">Max Skill Slots</label>
            <input v-model.number="settings.maxSkillSlots" type="number" class="form-input" />
          </div>
        </div>
      </div>

      <!-- Theme Configuration -->
      <div class="settings-section">
        <h2 class="section-title">Theme Configuration</h2>
        <div class="setting-card">
          <div class="setting-control">
            <label class="switch">
              <input v-model="settings.darkThemeEnabled" type="checkbox" />
              <span class="slider"></span>
            </label>
            <p class="control-label">Enable Dark Theme</p>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input v-model="settings.customThemesEnabled" type="checkbox" />
              <span class="slider"></span>
            </label>
            <p class="control-label">Enable Custom Themes</p>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="actions">
        <button @click="saveSettings" class="btn-primary large">Save All Settings</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'

const settings = reactive({
  maintenanceMode: false,
  maintenanceMessage: 'System undergoing maintenance. Please try again later.',
  announcement: '',
  moveTimer: 30,
  killRules: 'standard',
  bettingMin: 10,
  bettingMax: 100,
  houseFee: 5.0,
  bettingEnabled: true,
  skillsEnabled: true,
  maxSkillSlots: 5,
  darkThemeEnabled: true,
  customThemesEnabled: true
})

const saveSettings = () => {
  console.log('Settings saved:', settings)
}

const broadcastAnnouncement = () => {
  console.log('Announcement broadcasted:', settings.announcement)
}
</script>

<style scoped>
.admin-page { display: flex; height: 100vh; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); }
.page-content { flex: 1; overflow-y: auto; padding: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 2rem; }
.settings-section { margin-bottom: 2rem; }
.section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; }
.setting-card { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); }
.setting-control { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.switch { position: relative; display: inline-block; width: 50px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.1); transition: 0.4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: 0.4s; border-radius: 50%; }
input:checked + .slider { background: #667eea; }
input:checked + .slider:before { transform: translateX(26px); }
.control-label { color: #d1d5db; margin: 0; font-weight: 500; }
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; margin-bottom: 0.5rem; color: #ffffff; font-weight: 500; font-size: 0.875rem; }
.form-input, .form-textarea { width: 100%; padding: 0.625rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: #ffffff; font-family: inherit; font-size: 0.875rem; }
.form-input:focus, .form-textarea:focus { outline: none; background: rgba(255, 255, 255, 0.08); border-color: rgba(102, 126, 234, 0.5); }
.form-textarea { resize: vertical; min-height: 100px; }
.actions { margin-top: 2rem; display: flex; gap: 1rem; }
.btn-primary { padding: 0.75rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
.btn-primary.large { width: 100%; padding: 1rem; }
</style>
