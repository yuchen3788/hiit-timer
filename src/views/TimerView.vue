<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlansStore } from '@/stores/plans'
import { useTimerStore } from '@/stores/timer'
import { useThemeStore } from '@/stores/theme'
import { ensureAudioUnlocked } from '@/utils/audio'
import TimerDisplay from '@/components/TimerDisplay.vue'
import TimerControls from '@/components/TimerControls.vue'
import ExerciseProgress from '@/components/ExerciseProgress.vue'

const route = useRoute()
const router = useRouter()
const plansStore = usePlansStore()
const timerStore = useTimerStore()
const themeStore = useThemeStore()

const planId = route.params.planId as string
const plan = plansStore.getPlan(planId)

if (plan) {
  // 如果当前已经在运行同一个计划，则不重新加载
  if (timerStore.currentPlan?.id !== plan.id) {
    timerStore.loadPlan(plan)
  }
} else {
  router.replace('/')
}

const bgClass = computed(() => {
  if (timerStore.status === 'idle') return 'bg-idle'
  return timerStore.phase === 'exercise' ? 'bg-exercise' : 'bg-rest'
})

const bgStyle = computed(() => {
  if (timerStore.status === 'idle') return {}
  
  // 浅色模式下不使用JS动态计算的强渐变背景，而是使用CSS定义的柔和背景
  if (themeStore.theme === 'light') {
    return {}
  }
  
  const progress = 100 - timerStore.progress // 0 to 100
  
  if (timerStore.phase === 'exercise') {
    // 运动阶段: 深红 -> 浅红/橙红
    // 起始: #FF3333 (255, 51, 51)
    // 结束: #FF8C42 (255, 140, 66)
    // 混合比例
    const p = progress / 100
    const r = Math.round(255 + (255 - 255) * p)
    const g = Math.round(51 + (140 - 51) * p)
    const b = Math.round(51 + (66 - 51) * p)
    
    return {
      background: `linear-gradient(135deg, rgb(139, 0, 0) 0%, rgb(${r}, ${g}, ${b}) 100%)`
    }
  } else {
    // 休息阶段: 深青 -> 浅青/蓝
    const p = progress / 100
    // 起始: #00E5FF (0, 229, 255)
    // 结束: #2979FF (41, 121, 255)
    
    const r = Math.round(0 + (41 - 0) * p)
    const g = Math.round(229 + (121 - 229) * p)
    const b = Math.round(255 + (255 - 255) * p)
    
    return {
      background: `linear-gradient(135deg, rgb(0, 50, 50) 0%, rgb(${r}, ${g}, ${b}) 100%)`
    }
  }
})

// 监听状态变化，完成后跳转
watch(() => timerStore.status, (newStatus) => {
  if (newStatus === 'completed') {
    router.replace('/completion')
  }
})

onBeforeUnmount(() => {
  // 只有当不是跳转到完成页时，才重置计时器
  // 这样完成页可以获取到当前的 plan 信息用于展示
  if (timerStore.status !== 'completed') {
    timerStore.reset()
  }
})
</script>

<template>
  <div class="timer-view">
    <!-- 动态背景层 -->
    <div class="bg-layer" :class="[bgClass, themeStore.theme]" :style="bgStyle" />
    
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
        @start="ensureAudioUnlocked(); timerStore.start()"
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

/* 深色模式背景 (默认) */
.bg-layer.bg-exercise {
  background-color: #1a0805;
  background-image: radial-gradient(circle at 50% 30%, rgba(255, 81, 47, 0.15), transparent 70%);
}

.bg-layer.bg-rest {
  background-color: #051412;
  background-image: radial-gradient(circle at 50% 30%, rgba(67, 206, 162, 0.1), transparent 70%);
}

/* 浅色模式背景 (覆盖) */
.bg-layer.light.bg-exercise {
  background-color: #FFF0F5; /* 浅粉底色 */
  background-image: radial-gradient(circle at 50% 30%, rgba(224, 64, 251, 0.1), transparent 70%);
}

.bg-layer.light.bg-rest {
  background-color: #ECFDF5; /* 极浅的薄荷绿底色 */
  background-image: radial-gradient(circle at 50% 30%, rgba(52, 211, 153, 0.15), transparent 70%);
}

.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  padding-top: calc(16px + var(--safe-area-top));
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

/* 浅色模式下的返回按钮 */
[data-theme="light"] .btn-back {
  background: rgba(0, 0, 0, 0.05);
}

.btn-back:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .btn-back:active {
  background: rgba(0, 0, 0, 0.1);
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
  color: var(--text-primary);
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
