<template>
  <div :class="['flex gap-3 mb-4', isSent ? 'justify-end' : 'justify-start']">
    <!-- Avatar -->
    <div v-if="!isSent" class="flex-shrink-0">
      <img
        v-if="message.sender?.avatar_url"
        :src="message.sender.avatar_url"
        :alt="message.sender.display_name"
        class="w-8 h-8 rounded-full object-cover"
      />
      <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <span class="text-xs font-bold text-white">{{ message.sender?.display_name?.charAt(0).toUpperCase() }}</span>
      </div>
    </div>

    <!-- Message Bubble -->
    <div :class="[
      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg backdrop-blur-sm',
      isSent
        ? 'bg-blue-600/60 text-white rounded-br-none'
        : 'bg-slate-800/60 text-slate-50 rounded-bl-none border border-slate-700/30'
    ]">
      <!-- Sender name for received messages in group chat -->
      <div v-if="!isSent && showSenderName" class="text-xs text-slate-400 mb-1 font-semibold">
        {{ message.sender?.display_name }}
      </div>

      <!-- Content based on type -->
      <div v-if="message.type === 'text'" class="break-words whitespace-pre-wrap">
        {{ message.content }}
      </div>

      <img
        v-else-if="message.type === 'image'"
        :src="message.content"
        :alt="'Image from ' + (message.sender?.display_name || 'user')"
        class="rounded-md max-w-full h-auto max-h-64"
      />

      <VoicePlayer
        v-else-if="message.type === 'voice'"
        :src="message.content"
      />

      <!-- Actions -->
      <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-current border-opacity-20">
        <span class="text-xs opacity-75">
          {{ formatTime(message.created_at) }}
        </span>
        <button
          v-if="!isSent"
          @click="reportMessage"
          class="text-xs opacity-50 hover:opacity-100 transition-opacity hover:text-red-400"
          title="Report message"
        >
          ⚠
        </button>
        <span v-if="isSent && message.read" class="text-xs opacity-75" title="Read">
          ✓✓
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VoicePlayer from './VoicePlayer.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  },
  showSenderName: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['report']);

const isSent = computed(() => {
  return props.message.sender_id === props.currentUserId || props.message.user_id === props.currentUserId;
});

const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const reportMessage = () => {
  emit('report', props.message);
};
</script>
