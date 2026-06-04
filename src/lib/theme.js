// Theme definitions - 20 themes (2 free + 8 premium, each with day/night)

export const THEMES = {
  // FREE (2)
  classic: {
    id: 'classic',
    name: 'Classic',
    price: 0,
    currency: 'free',
    unlockCondition: 'none',
    day: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      bg: '#f8fafc',
      bgSecondary: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#cbd5e1',
    },
    night: {
      primary: '#0284c7',
      secondary: '#0891b2',
      accent: '#d97706',
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    price: 0,
    currency: 'free',
    unlockCondition: 'login_day_3',
    day: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#f59e0b',
      bg: '#f0fdf4',
      bgSecondary: '#e7f5e6',
      text: '#14532d',
      textSecondary: '#4d7c4f',
      border: '#a7e57d',
    },
    night: {
      primary: '#16a34a',
      secondary: '#14532d',
      accent: '#d97706',
      bg: '#051c0a',
      bgSecondary: '#1f3a1f',
      text: '#dcfce7',
      textSecondary: '#86efac',
      border: '#22c55e',
    }
  },

  // PREMIUM (8)
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    price: 100,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#fbbf24',
      bg: '#fdf2f8',
      bgSecondary: '#fce7f3',
      text: '#831843',
      textSecondary: '#be185d',
      border: '#fbcfe8',
    },
    night: {
      primary: '#db2777',
      secondary: '#be185d',
      accent: '#d97706',
      bg: '#3f0f34',
      bgSecondary: '#6b1b47',
      text: '#fbcfe8',
      textSecondary: '#f472b6',
      border: '#ec4899',
    }
  },
  salju: {
    id: 'salju',
    name: 'Salju',
    price: 140,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#3b82f6',
      bg: '#ecf9ff',
      bgSecondary: '#cffafe',
      text: '#064e78',
      textSecondary: '#0e7490',
      border: '#a5f3fc',
    },
    night: {
      primary: '#0891b2',
      secondary: '#064e78',
      accent: '#3b82f6',
      bg: '#052e3b',
      bgSecondary: '#164e63',
      text: '#cffafe',
      textSecondary: '#67e8f9',
      border: '#06b6d4',
    }
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    price: 200,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#fbbf24',
      bg: '#fffbeb',
      bgSecondary: '#fef3c7',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
    },
    night: {
      primary: '#b45309',
      secondary: '#78350f',
      accent: '#fbbf24',
      bg: '#3f3308',
      bgSecondary: '#78420f',
      text: '#fef3c7',
      textSecondary: '#fcd34d',
      border: '#d97706',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    price: 275,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#0284c7',
      secondary: '#0369a1',
      accent: '#06b6d4',
      bg: '#ecf8ff',
      bgSecondary: '#cffafe',
      text: '#0c3d66',
      textSecondary: '#0369a1',
      border: '#7dd3fc',
    },
    night: {
      primary: '#0369a1',
      secondary: '#0c3d66',
      accent: '#06b6d4',
      bg: '#0c2d47',
      bgSecondary: '#164e63',
      text: '#cffafe',
      textSecondary: '#7dd3fc',
      border: '#0284c7',
    }
  },
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic',
    price: 385,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#ff6b35',
      bg: '#fef2f2',
      bgSecondary: '#fee2e2',
      text: '#7f1d1d',
      textSecondary: '#b91c1c',
      border: '#fca5a5',
    },
    night: {
      primary: '#b91c1c',
      secondary: '#7f1d1d',
      accent: '#ff6b35',
      bg: '#450a0a',
      bgSecondary: '#7f1d1d',
      text: '#fee2e2',
      textSecondary: '#fca5a5',
      border: '#dc2626',
    }
  },
  steampunk: {
    id: 'steampunk',
    name: 'Steampunk',
    price: 540,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#8b5a3c',
      secondary: '#6b4423',
      accent: '#d97706',
      bg: '#faf5f0',
      bgSecondary: '#ede9e4',
      text: '#3e2723',
      textSecondary: '#6b4423',
      border: '#dcc7b8',
    },
    night: {
      primary: '#6b4423',
      secondary: '#3e2723',
      accent: '#d97706',
      bg: '#2a1810',
      bgSecondary: '#523a28',
      text: '#ede9e4',
      textSecondary: '#c4a89d',
      border: '#8b5a3c',
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    price: 755,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#06b6d4',
      bg: '#faf5ff',
      bgSecondary: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#7e22ce',
      border: '#e9d5ff',
    },
    night: {
      primary: '#9333ea',
      secondary: '#581c87',
      accent: '#06b6d4',
      bg: '#2d1b4e',
      bgSecondary: '#581c87',
      text: '#e9d5ff',
      textSecondary: '#c084fc',
      border: '#a855f7',
    }
  },
  space: {
    id: 'space',
    name: 'Space',
    price: 1055,
    currency: 'diamond',
    unlockCondition: 'purchase',
    day: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      bg: '#eff6ff',
      bgSecondary: '#dbeafe',
      text: '#1e3a8a',
      textSecondary: '#1e40af',
      border: '#93c5fd',
    },
    night: {
      primary: '#1e40af',
      secondary: '#0c2847',
      accent: '#60a5fa',
      bg: '#0a1428',
      bgSecondary: '#1e3a5f',
      text: '#dbeafe',
      textSecondary: '#60a5fa',
      border: '#3b82f6',
    }
  },
}

export const THEME_ORDER = [
  'classic', 'forest', 'sakura', 'salju', 'desert',
  'ocean', 'volcanic', 'steampunk', 'cyberpunk', 'space'
]

export function getTheme(themeId, isDaytime = true) {
  const theme = THEMES[themeId] || THEMES.classic
  return isDaytime ? theme.day : theme.night
}

export function isThemeFree(themeId) {
  return THEMES[themeId]?.price === 0
}

export function isPremiumTheme(themeId) {
  return THEMES[themeId]?.price > 0
}
