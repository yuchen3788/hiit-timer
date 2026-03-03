<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue'
import type { Exercise, TimerPhase } from '@/types'

const props = defineProps<{
  exercises: Exercise[]
  currentIndex: number
  phase: TimerPhase
}>()

const containerRef = ref<HTMLElement | null>(null)

// 自动滚动到当前项
function scrollToActive() {
  if (!containerRef.value) return
  const activeEl = containerRef.value.querySelector('.exercise-item.active') as HTMLElement
  if (activeEl) {
    const container = containerRef.value
    const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
}

watch(() => props.currentIndex, async () => {
  await nextTick()
  scrollToActive()
}, { immediate: true })

onMounted(() => {
  // 初始加载时也要滚动
  setTimeout(scrollToActive, 100)
})
</script>

<template>
  <div class="exercise-progress-wrapper">
    <div class="exercise-progress" ref="containerRef">
      <div
        v-for="(exercise, index) in exercises"
        :key="exercise.id"
        class="exercise-item"
        :class="{
          active: index === currentIndex,
          completed: index < currentIndex,
          upcoming: index > currentIndex,
        }"
      >
        <div class="status-indicator">
          <!-- 完成的勾选图标 -->
          <div v-if="index < currentIndex" class="check-icon">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- 进行中的圆点 -->
          <div 
            v-else 
            class="dot"
            :class="{ 
              'pulse-exercise': phase === 'exercise' && index === currentIndex,
              'pulse-rest': phase === 'rest' && index === currentIndex 
            }"
          ></div>
        </div>
        
        <span class="name">{{ exercise.name }}</span>
        <span v-if="index === currentIndex" class="duration-hint">{{ exercise.duration }}s</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-progress-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}


.exercise-progress {
  display: flex;
  gap: 24px;
  padding: 16px 50% 24px; /* 居中布局 */
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.exercise-progress::-webkit-scrollbar {
  display: none;
}

.exercise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 60px;
  opacity: 0.3;
  transform: scale(0.85);
  filter: grayscale(1);
}

.exercise-item.active {
  opacity: 1;
  transform: scale(1.1);
  filter: grayscale(0);
}

.exercise-item.completed {
  opacity: 0.5;
}

.status-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: var(--rest-start);
  animation: scaleIn 0.3s ease;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s ease;
}

.dot.pulse-exercise {
  background: var(--exercise-start);
  box-shadow: 0 0 0 0 rgba(255, 81, 47, 0.7);
  animation: pulse-orange 2s infinite;
}

.dot.pulse-rest {
  background: var(--rest-start);
  box-shadow: 0 0 0 0 rgba(67, 206, 162, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-orange {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 81, 47, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 81, 47, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 81, 47, 0); }
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(67, 206, 162, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(67, 206, 162, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(67, 206, 162, 0); }
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.duration-hint {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
  position: absolute;
  bottom: -18px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
