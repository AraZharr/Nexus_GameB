import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getTheme } from '@/lib/theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem('theme') || 'classic')
  const isDaytime = ref(isCurrentlyDay())
  const overrideMode = ref(localStorage.getItem('themeOverride') || 'auto') // auto, day, night

  const cssVariables = computed(() => {
    const isDayMode = overrideMode.value === 'auto' ? isDaytime.value : overrideMode.value === 'day'
    const theme = getTheme(currentTheme.value, isDayMode)

    return {
      '--color-primary': theme.primary,
      '--color-secondary': theme.secondary,
      '--color-accent': theme.accent,
      '--color-bg': theme.bg,
      '--color-bg-secondary': theme.bgSecondary,
      '--color-text': theme.text,
      '--color-text-secondary': theme.textSecondary,
      '--color-border': theme.border,
    }
  })

  function isCurrentlyDay() {
    const hour = new Date().getHours()
    return hour >= 6 && hour < 18
  }

  function setTheme(themeId) {
    currentTheme.value = themeId
    localStorage.setItem('theme', themeId)
    applyTheme()
  }

  function setOverrideMode(mode) {
    overrideMode.value = mode
    localStorage.setItem('themeOverride', mode)
    applyTheme()
  }

  function applyTheme() {
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }

  function updateDaytime() {
    isDaytime.value = isCurrentlyDay()
    if (overrideMode.value === 'auto') {
      applyTheme()
    }
  }

  // Update theme every minute
  setInterval(updateDaytime, 60000)

  // Apply theme on mount
  applyTheme()

  return {
    currentTheme,
    isDaytime,
    overrideMode,
    cssVariables,
    setTheme,
    setOverrideMode,
    applyTheme,
    updateDaytime,
  }
})
