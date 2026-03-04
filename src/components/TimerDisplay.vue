<script setup lang="ts">
import { computed } from 'vue'
import type { TimerPhase } from '@/types'

const props = defineProps<{
  remainingSeconds: number
  progress: number
  phase: TimerPhase
  exerciseName: string
}>()

const phaseLabel = computed(() =>
  props.phase === 'exercise' ? props.exerciseName || '运动' : '休息'
)
</script>

<template>
  <div class="timer-display-focus">
    <div class="time-container">
      <div class="time-value">{{ remainingSeconds }}</div>
      <div class="phase-label" :class="phase">{{ phaseLabel }}</div>
    </div>
  </div>
</template>

<style scoped>
.timer-display-focus {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.time-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.time-value {
  font-size: 28vw;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* 在大屏幕限制最大字体 */
@media (min-width: 600px) {
  .time-value {
    font-size: 160px;
  }
}

.phase-label {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  opacity: 0.8;
  color: var(--text-primary);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

[data-theme="light"] .phase-label {
  background: rgba(0, 0, 0, 0.06);
}
</style>
