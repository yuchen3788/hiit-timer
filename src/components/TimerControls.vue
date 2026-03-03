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
      aria-label="重置"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33235 5.11309 5.86477 6.86477" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 4V7H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      class="btn-main"
      :class="{ paused: status === 'paused', running: status === 'running' }"
      @click="status === 'running' ? emit('pause') : emit('start')"
      :aria-label="status === 'running' ? '暂停' : '开始'"
    >
      <div class="icon-wrapper">
        <svg v-if="status === 'running'" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
        <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 4px;">
          <path d="M8 5V19L19 12L8 5Z" />
        </svg>
      </div>
    </button>

    <div class="btn-placeholder" />
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  position: relative;
  z-index: 20;
}

.btn-main {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--text-primary);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-main:active {
  transform: scale(0.92);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.btn-main.running {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

/* 浅色模式运行中按钮边框 */
[data-theme="light"] .btn-main.running {
  border-color: rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-reset {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

/* 浅色模式重置按钮 */
[data-theme="light"] .btn-reset {
  background: rgba(0, 0, 0, 0.05);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* 浅色模式重置按钮悬停 */
[data-theme="light"] .btn-reset:hover {
  background: rgba(0, 0, 0, 0.08);
}

.btn-reset:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.08);
}

/* 浅色模式重置按钮按下 */
[data-theme="light"] .btn-reset:active {
  background: rgba(0, 0, 0, 0.1);
}

.btn-reset:disabled {
  opacity: 0.3;
  pointer-events: none;
  transform: scale(0.8);
}

.btn-placeholder {
  width: 56px;
  height: 56px;
}
</style>
