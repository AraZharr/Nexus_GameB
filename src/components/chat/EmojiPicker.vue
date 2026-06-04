<template>
  <div class="bg-slate-900/95 rounded-lg p-4 shadow-lg border border-slate-700/30 backdrop-blur-md max-w-md w-full">
    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search emojis..."
        class="w-full px-3 py-2 bg-slate-800 text-slate-50 rounded border border-slate-700 focus:border-blue-500 focus:outline-none text-sm"
      />
    </div>

    <!-- Category tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-slate-700/30">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        :class="[
          'px-3 py-1 rounded text-sm transition-all whitespace-nowrap',
          activeCategory === cat
            ? 'bg-blue-600/60 text-white'
            : 'text-slate-400 hover:text-slate-300'
        ]"
      >
        {{ getCategoryIcon(cat) }}
      </button>
    </div>

    <!-- Recent emojis -->
    <div v-if="!searchQuery && recentEmojis.length > 0" class="mb-4">
      <p class="text-xs text-slate-400 mb-2 uppercase font-semibold">Recent</p>
      <div class="grid grid-cols-8 gap-2 mb-4">
        <button
          v-for="emoji in recentEmojis"
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="text-2xl hover:scale-110 transition-transform hover:bg-slate-800/50 p-1 rounded"
        >
          {{ emoji }}
        </button>
      </div>
      <div class="border-b border-slate-700/30 mb-4" />
    </div>

    <!-- Emoji grid -->
    <div class="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji"
        @click="selectEmoji(emoji)"
        class="text-2xl hover:scale-110 transition-transform hover:bg-slate-800/50 p-1 rounded"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredEmojis.length === 0" class="text-center py-4">
      <p class="text-slate-400 text-sm">No emojis found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['select']);

const searchQuery = ref('');
const activeCategory = ref('recent');
const recentEmojis = ref([]);

const categories = ['recent', 'smileys', 'people', 'nature', 'food', 'travel', 'activity', 'objects', 'symbols'];

const emojisByCategory = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '😑', '😐', '😶', '😏', '😒', '🙁', '☹️', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤮', '🤢', '🤮', '🤮', '🤮'],
  people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🤜', '🤛'],
  nature: ['🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🍟', '🍖', '🍗', '🥩', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🧁', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🍯', '🥛', '🥤', '🍶', '🍹', '🍸', '🍷', '🍾', '🍻', '🥂', '🥃', '🥤'],
  food: ['🍕', '🍔', '🍟', '🌭', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🧁', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🍯', '🥛', '🥤'],
  travel: ['✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛳️', '⛴️', '🛥️', '🛩️', '💺', '🚂', '🚝', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜'],
  activity: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '⛸️', '🎣', '🎽', '🎿', '⛷️', '🏂', '🪂', '🛷', '🥌', '🎯', '🪀', '🪃', '🎪'],
  objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎬', '📺', '📷', '📸', '📹', '🎞️', '📽️', '🎦', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '🧾', '✉️', '📩', '📨', '📤', '📥', '📦', '🏷️', '🧧', '📪', '📫', '📬', '📭', '📮', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '📁', '📂', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📐', '📏', '🧮', '📓', '📔', '📒', '📕', '📖', '📗', '📘', '📙', '📚', '📖', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '⚒️', '🛠️', '🔨', '⛏️', '⚙️', '🔧', '🔩', '⛓️', '🧰', '🔫', '💣', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💜', '💛', '💚', '💙', '💎', '💍', '👑', '🔱', '⚜️', '🔰', '📛', '🔱', '☪️', '✡️', '🕉️', '☸️', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🔱', '📛', '⚫', '⚪', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤'],
};

const filteredEmojis = computed(() => {
  let emojis = [];

  if (searchQuery.value) {
    // Simple search - in production, you'd have emoji names/aliases
    const query = searchQuery.value.toLowerCase();
    for (const categoryEmojis of Object.values(emojisByCategory)) {
      emojis = emojis.concat(categoryEmojis);
    }
  } else {
    emojis = emojisByCategory[activeCategory.value] || [];
  }

  return emojis.slice(0, 100);
});

const getCategoryIcon = (category) => {
  const icons = {
    recent: '🕐',
    smileys: '😀',
    people: '👋',
    nature: '🌿',
    food: '🍕',
    travel: '✈️',
    activity: '⚽',
    objects: '💡',
    symbols: '❤️'
  };
  return icons[category] || '';
};

const selectEmoji = (emoji) => {
  emit('select', emoji);

  // Add to recent
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value.unshift(emoji);
    if (recentEmojis.value.length > 12) {
      recentEmojis.value.pop();
    }
  }

  // Switch to recent tab
  activeCategory.value = 'recent';
};
</script>
