<script setup lang="ts">
import { computed } from 'vue'
import type { TimerPhase } from '@/types'

const props = defineProps<{
  remainingSeconds: number
  progress: number
  phase: TimerPhase
  exerciseName: string
}>()

const formattedTime = computed(() => {
  const mins = Math.floor(props.remainingSeconds / 60)
  const secs = props.remainingSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const circumference = 2 * Math.PI * 120
const dashOffset = computed(() => circumference * (1 - props.progress))

const phaseLabel = computed(() =>
  props.phase === 'exercise' ? '运动' : '休息'
)
</script>

<template>
  <div class="timer-display">
    <svg class="progress-ring" viewBox="0 0 260 260">
      <defs>
        <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--exercise-start)" />
          <stop offset="100%" stop-color="var(--exercise-end)" />
        </linearGradient>
        <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--rest-start)" />
          <stop offset="100%" stop-color="var(--rest-end)" />
        </linearGradient>
      </defs>
      <!-- 背景圈 -->
      <circle
        cx="130" cy="130" r="120"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="8"
      />
      <!-- 进度圈 -->
      <circle
        class="progress-circle"
        cx="130" cy="130" r="120"
        fill="none"
        :stroke="phase === 'exercise' ? 'url(#exerciseGradient)' : 'url(#restGradient)'"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 130 130)"
      />
    </svg>

    <div class="timer-content">
      <div class="time" :class="phase">{{ formattedTime }}</div>
      <div class="phase-label" :class="phase">{{ phaseLabel }}</div>
      <div class="exercise-name">{{ exerciseName }}</div>
    </div>
  </div>
</template>

<style scoped>
.timer-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
}

.progress-circle {
  transition: stroke-dashoffset 0.3s ease;
}

.timer-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.time {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
}

.time.exercise {
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time.rest {
  background: linear-gradient(135deg, var(--rest-start), var(--rest-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.phase-label {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 4px;
}

.phase-label.exercise {
  color: var(--exercise-start);
}

.phase-label.rest {
  color: var(--rest-start);
}

.exercise-name {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
