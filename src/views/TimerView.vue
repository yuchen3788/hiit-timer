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

const roundInfo = computed(() => {
  if (!timerStore.currentPlan) return ''
  return `第 ${timerStore.currentRound} / ${timerStore.currentPlan.rounds} 轮`
})

const bgClass = computed(() => {
  if (timerStore.status === 'idle') return 'bg-idle'
  return timerStore.phase === 'exercise' ? 'bg-exercise' : 'bg-rest'
})

onBeforeUnmount(() => {
  timerStore.reset()
})
</script>

<template>
  <div class="timer-view" :class="bgClass">
    <header class="top-bar">
      <button class="btn-back" @click="router.push('/')">←</button>
      <div class="top-info">
        <h2 class="plan-name">{{ timerStore.currentPlan?.name }}</h2>
        <span class="round-info">{{ roundInfo }}</span>
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
  transition: background-color 0.5s ease;
}

.bg-idle {
  background-color: var(--bg-primary);
}

.bg-exercise {
  background-color: #2a1510;
}

.bg-rest {
  background-color: #0a1a20;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 12px 20px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:active {
  transform: scale(0.9);
}

.top-info {
  flex: 1;
  text-align: center;
}

.plan-name {
  font-size: 17px;
  font-weight: 700;
}

.round-info {
  font-size: 13px;
  color: var(--text-secondary);
}

.top-spacer {
  width: 40px;
}

.timer-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-footer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 20px 32px;
  padding-bottom: calc(32px + var(--safe-area-bottom));
}
</style>
