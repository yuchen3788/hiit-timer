<script setup lang="ts">
import type { TimerStatus } from '@/types'

defineProps<{
  status: TimerStatus
}>()

const emit = defineEmits<{
  start: []
  pause: []
  reset: []
}>()
</script>

<template>
  <div class="timer-controls">
    <button
      class="btn-reset"
      :disabled="status === 'idle'"
      @click="emit('reset')"
    >
      ↺
    </button>

    <button
      class="btn-main"
      @click="status === 'running' ? emit('pause') : emit('start')"
    >
      {{ status === 'running' ? '⏸' : '▶' }}
    </button>

    <!-- 占位保持居中 -->
    <div class="btn-placeholder" />
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.btn-main {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  color: #fff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
}

.btn-main:active {
  transform: scale(0.9);
}

.btn-reset {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, opacity 0.2s ease;
}

.btn-reset:disabled {
  opacity: 0.3;
  pointer-events: none;
}

.btn-reset:active {
  transform: scale(0.9);
}

.btn-placeholder {
  width: 48px;
  height: 48px;
}
</style>
