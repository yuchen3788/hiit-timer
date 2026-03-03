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
const dashOffset = computed(() => circumference * props.progress)

const phaseLabel = computed(() =>
  props.phase === 'exercise' ? '运动' : '休息'
)
</script>

<template>
  <div class="timer-display">
    <svg class="progress-ring" viewBox="0 0 280 280">
      <defs>
        <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--exercise-start)" />
          <stop offset="100%" stop-color="var(--exercise-end)" />
        </linearGradient>
        <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--rest-start)" />
          <stop offset="100%" stop-color="var(--rest-end)" />
        </linearGradient>
        <filter id="glow-exercise" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" in="coloredBlur" result="softGlow"/>
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-rest" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" in="coloredBlur" result="softGlow"/>
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- 背景装饰 -->
      <circle
        cx="140" cy="140" r="130"
        fill="none"
        stroke="rgba(255,255,255,0.03)"
        stroke-width="1"
        stroke-dasharray="4 4"
      />
      
      <!-- 轨道底色 -->
      <circle
        cx="140" cy="140" r="120"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        stroke-width="12"
        stroke-linecap="round"
      />
      
      <!-- 进度条 -->
      <circle
        class="progress-circle"
        cx="140" cy="140" r="120"
        fill="none"
        :stroke="phase === 'exercise' ? 'url(#exerciseGradient)' : 'url(#restGradient)'"
        stroke-width="14"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :filter="phase === 'exercise' ? 'url(#glow-exercise)' : 'url(#glow-rest)'"
      />
    </svg>

    <div class="timer-content">
      <div class="phase-badge" :class="phase">
        {{ phaseLabel }}
      </div>
      <div class="time-wrapper">
        <div class="time" :class="phase">{{ formattedTime }}</div>
      </div>
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
  width: 280px;
  height: 280px;
  margin: 0 auto;
}

.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg); /* 旋转整个 SVG 容器，避免内部元素坐标计算问题 */
}

.progress-circle {
  transition: stroke-dashoffset 0.1s linear, stroke 0.3s ease;
}

.timer-content {
  position: relative;
  text-align: center;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180px;
}

.phase-badge {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 8px;
  transition: all var(--transition-normal);
}

.phase-badge.exercise {
  background: rgba(255, 81, 47, 0.15);
  color: var(--exercise-start);
  border: 1px solid rgba(255, 81, 47, 0.3);
}

.phase-badge.rest {
  background: rgba(67, 206, 162, 0.15);
  color: var(--rest-start);
  border: 1px solid rgba(67, 206, 162, 0.3);
}

.time-wrapper {
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -2px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.time.exercise {
  background: linear-gradient(135deg, #fff 0%, var(--exercise-start) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.time.rest {
  background: linear-gradient(135deg, #fff 0%, var(--rest-start) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.exercise-name {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 12px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
}
</style>
