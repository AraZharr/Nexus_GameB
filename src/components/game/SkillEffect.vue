<template>
  <div class="fixed inset-0 pointer-events-none" @animationend="handleAnimationEnd">
    <!-- Screen Flash -->
    <div
      v-if="effectType === 'screen_flash'"
      class="absolute inset-0 bg-white"
      :style="{ animation: `flashFade ${duration}ms ease-out forwards` }"
    ></div>

    <!-- Text Overlay -->
    <div
      v-if="effectType === 'text_overlay'"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      :style="{ animation: `textBounceFloat ${duration}ms ease-out forwards` }"
    >
      <div class="text-center">
        <div class="text-6xl font-bold text-white drop-shadow-lg mb-2">
          <span v-if="skillEmoji" class="block text-5xl">{{ skillEmoji }}</span>
        </div>
        <p class="text-2xl font-bold text-white drop-shadow-lg">{{ textContent }}</p>
      </div>
    </div>

    <!-- Particle Trail Canvas -->
    <canvas
      v-if="effectType === 'particle_trail'"
      ref="particleCanvas"
      class="absolute inset-0 w-full h-full"
    ></canvas>

    <!-- Board Spotlight -->
    <div
      v-if="effectType === 'board_effect' && subType === 'spotlight'"
      class="absolute inset-0"
      :style="{ animation: `spotlightPulse ${duration}ms ease-out forwards` }"
    >
      <div
        class="absolute"
        :style="{
          left: position.x + '%',
          top: position.y + '%',
          width: '200px',
          height: '200px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)'
        }"
      ></div>
    </div>

    <!-- Confetti -->
    <div
      v-if="effectType === 'confetti'"
      class="absolute inset-0"
    >
      <div
        v-for="particle in confettiParticles"
        :key="particle.id"
        class="absolute"
        :style="{ animation: `confettiFall ${duration}ms ease-in forwards` }"
      >
        <div
          :style="{
            left: particle.x + 'px',
            width: particle.size + 'px',
            height: particle.size + 'px',
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: particle.shape === 'circle' ? '50%' : '0'
          }"
        ></div>
      </div>
    </div>

    <!-- Darkness Board Effect -->
    <div
      v-if="effectType === 'board_effect' && subType === 'darkness'"
      class="absolute inset-0"
      :style="{ animation: `darknessFade ${duration}ms ease-out forwards` }"
    >
      <div
        class="absolute inset-0"
        :style="{
          background: 'radial-gradient(circle at ' + position.x + '% ' + position.y + '%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)'
        }"
      ></div>
    </div>

    <!-- Grid Pulse -->
    <div
      v-if="effectType === 'board_effect' && subType === 'grid_pulse'"
      class="absolute inset-0"
      :style="{ animation: `gridPulse ${duration}ms ease-out forwards` }"
    >
      <div
        class="absolute inset-0 opacity-40"
        :style="{
          backgroundImage: 'linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(0deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps({
  effectType: {
    type: String,
    required: true,
    validator: (value) =>
      [
        'text_overlay',
        'particle_trail',
        'screen_flash',
        'board_effect',
        'confetti',
        'audio'
      ].includes(value)
  },
  duration: {
    type: Number,
    default: 1000
  },
  position: {
    type: Object,
    default: () => ({ x: 50, y: 50 })
  },
  textContent: {
    type: String,
    default: 'Skill Used!'
  },
  skillEmoji: {
    type: String,
    default: '⚡'
  },
  subType: {
    type: String,
    default: 'spotlight'
  }
})

const emit = defineEmits(['complete'])

const particleCanvas = ref(null)
const confettiParticles = ref([])

const generateConfetti = () => {
  const particles = []
  for (let i = 0; i < 30; i++) {
    particles.push({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20,
      size: Math.random() * 8 + 4,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: Math.random() * 3 + 2
    })
  }
  confettiParticles.value = particles
}

const initParticleTrail = () => {
  if (!particleCanvas.value) return

  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let animationId = null
  const particles = []
  let frameCount = 0

  // Create particles along movement path
  const createParticles = () => {
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: props.position.x * window.innerWidth / 100,
        y: props.position.y * window.innerHeight / 100,
        life: 1,
        size: Math.random() * 6 + 3,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: `rgba(255, 165, 0, ${Math.random() * 0.7 + 0.3})`
      })
    }
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      p.vy += 0.1 // gravity

      ctx.fillStyle = `rgba(255, 165, 0, ${p.life * 0.7})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()

      if (p.life <= 0) particles.splice(i, 1)
    }

    frameCount++
    if (frameCount < props.duration / 16) {
      createParticles()
      animationId = requestAnimationFrame(animate)
    }
  }

  animate()

  return () => {
    if (animationId) cancelAnimationFrame(animationId)
  }
}

const handleAnimationEnd = () => {
  emit('complete')
}

onMounted(() => {
  if (props.effectType === 'particle_trail') {
    initParticleTrail()
  } else if (props.effectType === 'confetti') {
    generateConfetti()
  }
})
</script>

<style scoped>
@keyframes flashFade {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

@keyframes textBounceFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -60%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -120%) scale(0.8);
  }
}

@keyframes spotlightPulse {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes darknessFade {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes gridPulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.4;
    transform: scale(1);
  }
  100% {
    opacity: 0;
  }
}
</style>
