<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlansStore } from '@/stores/plans'
import { useTimerStore } from '@/stores/timer'
import TimerDisplay from '@/components/TimerDisplay.vue'
import TimerControls from '@/components/TimerControls.vue'
import ExerciseProgress from '@/components/ExerciseProgress.vue'

const route = useRoute()
const router = useRouter()
const plansStore = usePlansStore()
const timerStore = useTimerStore()

const planId = route.params.planId as string
const plan = plansStore.getPlan(planId)

if (plan) {
  timerStore.loadPlan(plan)
} else {
  router.replace('/')
}

const bgClass = computed(() => {
  if (timerStore.status === 'idle') return 'bg-idle'
  return timerStore.phase === 'exercise' ? 'bg-exercise' : 'bg-rest'
})

onBeforeUnmount(() => {
  timerStore.reset()
})
</script>

<template>
  <div class="timer-view">
    <!-- 动态背景层 -->
    <div class="bg-layer" :class="bgClass" />
    
    <header class="top-bar">
      <button class="btn-back" @click="router.push('/')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="top-info">
        <h2 class="plan-name">{{ timerStore.currentPlan?.name }}</h2>
        <div class="round-indicator">
          <span class="round-count">{{ timerStore.currentRound }}</span>
          <span class="round-total">/ {{ timerStore.currentPlan?.rounds }} 轮</span>
        </div>
      </div>
      <div class="top-spacer" />
    </header>

    <div class="timer-body">
      <TimerDisplay
        :remaining-seconds="timerStore.remainingSeconds"
        :progress="timerStore.progress"
        :phase="timerStore.phase"
        :exercise-name="timerStore.currentExercise?.name ?? ''"
      />
    </div>

    <div class="timer-footer">
      <ExerciseProgress
        v-if="timerStore.currentPlan"
        :exercises="timerStore.currentPlan.exercises"
        :current-index="timerStore.currentExerciseIndex"
        :phase="timerStore.phase"
      />

      <TimerControls
        :status="timerStore.status"
        @start="timerStore.start()"
        @pause="timerStore.pause()"
        @reset="timerStore.reset()"
      />
    </div>
  </div>
</template>

<style scoped>
.timer-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--bg-primary);
  transition: background-color 0.8s ease;
}

.bg-layer.bg-idle {
  background-color: var(--bg-primary);
}

.bg-layer.bg-exercise {
  background-color: #1a0805; /* 深红褐色 */
  background-image: radial-gradient(circle at 50% 30%, rgba(255, 81, 47, 0.15), transparent 70%);
}

.bg-layer.bg-rest {
  background-color: #051412; /* 深青色 */
  background-image: radial-gradient(circle at 50% 30%, rgba(67, 206, 162, 0.1), transparent 70%);
}

.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 16px 20px;
}

.btn-back {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.btn-back:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.1);
}

.top-info {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.round-indicator {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-feature-settings: "tnum";
}

.round-count {
  color: var(--text-highlight);
  font-weight: 700;
}

.top-spacer {
  width: 44px;
}

.timer-body {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

.timer-footer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 24px 48px;
  padding-bottom: calc(48px + var(--safe-area-bottom));
  background: linear-gradient(to top, var(--bg-primary) 0%, transparent 100%);
}
</style>
