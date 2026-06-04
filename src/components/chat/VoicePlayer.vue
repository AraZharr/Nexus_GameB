<template>
  <div class="flex flex-col gap-2 min-w-48">
    <!-- Player controls -->
    <div class="flex items-center gap-2">
      <button
        @click="togglePlay"
        class="flex-shrink-0 w-8 h-8 rounded-full bg-current bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center justify-center"
        :title="isPlaying ? 'Pause' : 'Play'"
      >
        <span class="text-sm">{{ isPlaying ? '⏸' : '▶' }}</span>
      </button>

      <!-- Progress bar -->
      <div class="flex-1 flex flex-col gap-1">
        <div
          class="h-6 bg-current bg-opacity-10 rounded cursor-pointer relative group"
          @click="scrubTo"
        >
          <!-- Waveform visualization -->
          <div class="absolute inset-0 flex items-center justify-center gap-0.5 px-1">
            <div
              v-for="(bar, i) in waveform"
              :key="i"
              :style="{
                height: `${bar * 100}%`,
                opacity: isPlaying && currentTime > (i / waveform.length) * duration ? 0.8 : 0.4
              }"
              class="flex-1 bg-current rounded-full transition-opacity"
            />
          </div>

          <!-- Progress indicator -->
          <div
            class="absolute top-0 left-0 h-full bg-current bg-opacity-30 rounded transition-all"
            :style="{ width: `${(currentTime / duration) * 100}%` }"
          />

          <!-- Scrub handle on hover -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-current rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }"
          />
        </div>

        <!-- Time display -->
        <div class="flex justify-between text-xs opacity-75 font-mono">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <!-- Status message -->
    <div v-if="error" class="text-xs text-red-400">
      Error loading audio
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  }
});

const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const error = ref(false);

const waveform = computed(() => {
  // Generate a simple waveform visualization
  // In production, you'd analyze the actual audio data
  return Array.from({ length: 20 }, () => Math.random() * 0.8 + 0.2);
});

const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const togglePlay = () => {
  if (!audio.value) return;

  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play().catch(() => {
      error.value = true;
    });
  }
};

const scrubTo = (event) => {
  if (!audio.value || !duration.value) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = x / rect.width;
  audio.value.currentTime = percentage * duration.value;
};

const updateTime = () => {
  if (audio.value) {
    currentTime.value = audio.value.currentTime;
  }
};

const updateDuration = () => {
  if (audio.value) {
    duration.value = audio.value.duration;
  }
};

const handlePlay = () => {
  isPlaying.value = true;
};

const handlePause = () => {
  isPlaying.value = false;
};

const handleError = () => {
  error.value = true;
  isPlaying.value = false;
};

const handleEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

onMounted(() => {
  audio.value = new Audio(props.src);
  audio.value.addEventListener('timeupdate', updateTime);
  audio.value.addEventListener('loadedmetadata', updateDuration);
  audio.value.addEventListener('play', handlePlay);
  audio.value.addEventListener('pause', handlePause);
  audio.value.addEventListener('error', handleError);
  audio.value.addEventListener('ended', handleEnded);
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.removeEventListener('timeupdate', updateTime);
    audio.value.removeEventListener('loadedmetadata', updateDuration);
    audio.value.removeEventListener('play', handlePlay);
    audio.value.removeEventListener('pause', handlePause);
    audio.value.removeEventListener('error', handleError);
    audio.value.removeEventListener('ended', handleEnded);
  }
});
</script>
