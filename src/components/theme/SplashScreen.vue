<template>
  <transition name="splash" @after-leave="$emit('splashComplete')">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 cursor-pointer" @click="skip">
      <div class="relative w-full h-full flex items-center justify-center">
        <!-- Canvas for particles -->
        <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />

        <!-- Logo and text -->
        <div class="relative z-10 text-center">
          <div ref="logoRef" class="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
            NEXUS
          </div>
          <div class="text-xl text-slate-400 font-light tracking-wider">
            BOARD
          </div>
          <div class="text-sm text-slate-500 mt-8 animate-pulse">
            Play Chess, Ludo & Snakes with friends
          </div>
        </div>

        <!-- Skip hint -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-600">
          Tap to skip
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['splashComplete'])

const show = ref(true)
const canvasRef = ref(null)
const logoRef = ref(null)

let particles = []
let animationId = null
let startTime = 0

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 15
    this.vy = (Math.random() - 0.5) * 15 - 5
    this.life = 1
    this.decay = Math.random() * 0.02 + 0.01
    this.size = Math.random() * 4 + 2
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.1
    this.life -= this.decay
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life
    ctx.fillStyle = '#0ea5e9'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function createParticles(x, y, count = 50) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y))
  }
}

function animate(currentTime) {
  if (!startTime) startTime = currentTime

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  // Clear canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Update and draw particles
  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    p.update()
    p.draw(ctx)
  })

  const elapsed = currentTime - startTime

  // Create particle burst at specific time
  if (elapsed > 600 && elapsed < 700 && particles.length < 10) {
    createParticles(canvas.width / 2, canvas.height / 2, 80)
  }

  // Continue animation
  if (elapsed < 2500) {
    animationId = requestAnimationFrame(animate)
  } else {
    skip()
  }
}

function skip() {
  show.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })

    animationId = requestAnimationFrame(animate)
  }
})
</script>

<style scoped>
.splash-enter-active, .splash-leave-active {
  transition: opacity 0.5s ease-out;
}

.splash-enter-from, .splash-leave-to {
  opacity: 0;
}
</style>
