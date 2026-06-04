<template>
  <div class="stat-card" :class="variantClass">
    <div class="card-content">
      <div class="stat-header">
        <div class="stat-label">{{ label }}</div>
        <div v-if="trend" class="trend-indicator" :class="trendClass">
          <svg
            class="trend-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="trend === 'up'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7H5v12h12V9m0-2l6 6m0 0l-6 6m6-6H7"
            ></path>
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 17H5V5h12v10m0 0l6-6m0 0l-6-6m6 6H7"
            ></path>
          </svg>
          <span class="trend-value">{{ trendValue }}%</span>
        </div>
      </div>
      <div class="stat-value">{{ formattedValue }}</div>
      <div v-if="description" class="stat-description">{{ description }}</div>
    </div>
    <div class="card-accent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  trend: {
    type: String,
    default: null,
    validator: (val) => [null, 'up', 'down'].includes(val)
  },
  trendValue: {
    type: [Number, String],
    default: null
  },
  variant: {
    type: String,
    default: 'blue',
    validator: (val) => ['blue', 'green', 'orange', 'red'].includes(val)
  },
  description: {
    type: String,
    default: null
  },
  format: {
    type: Function,
    default: (val) => {
      if (typeof val === 'number') {
        return val.toLocaleString('en-US')
      }
      return val
    }
  }
})

const formattedValue = computed(() => props.format(props.value))

const variantClass = computed(() => {
  return `variant-${props.variant}`
})

const trendClass = computed(() => {
  if (!props.trend) return ''
  return `trend-${props.trend}`
})
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
}

.card-content {
  position: relative;
  z-index: 2;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #22c55e;
}

.trend-indicator.trend-down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.trend-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.trend-value {
  font-weight: 700;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.stat-description {
  font-size: 0.875rem;
  color: #9ca3af;
}

.card-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
  pointer-events: none;
}

/* Variant styles */
.stat-card.variant-blue {
  border-color: rgba(102, 126, 234, 0.3);
}

.stat-card.variant-blue .card-accent {
  background: #667eea;
}

.stat-card.variant-blue:hover {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.1);
}

.stat-card.variant-green {
  border-color: rgba(34, 197, 94, 0.3);
}

.stat-card.variant-green .card-accent {
  background: #22c55e;
}

.stat-card.variant-green:hover {
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
}

.stat-card.variant-orange {
  border-color: rgba(251, 146, 60, 0.3);
}

.stat-card.variant-orange .card-accent {
  background: #fb923c;
}

.stat-card.variant-orange:hover {
  border-color: rgba(251, 146, 60, 0.5);
  box-shadow: 0 0 20px rgba(251, 146, 60, 0.1);
}

.stat-card.variant-red {
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-card.variant-red .card-accent {
  background: #ef4444;
}

.stat-card.variant-red:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
}
</style>
