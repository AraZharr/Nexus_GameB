<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium mb-2 text-slate-300">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg',
        'text-slate-50 placeholder-slate-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-all duration-200'
      ]"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  label: String,
  placeholder: String
})

defineEmits(['update:modelValue'])
</script>
