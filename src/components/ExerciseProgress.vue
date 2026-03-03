<script setup lang="ts">
import type { Exercise, TimerPhase } from '@/types'

defineProps<{
  exercises: Exercise[]
  currentIndex: number
  phase: TimerPhase
}>()
</script>

<template>
  <div class="exercise-progress">
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
      <div
        class="dot"
        :class="{ exercise: phase === 'exercise' && index === currentIndex, rest: phase === 'rest' && index === currentIndex }"
      />
      <span class="name">{{ exercise.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.exercise-progress {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.exercise-progress::-webkit-scrollbar {
  display: none;
}

.exercise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.exercise-item.active {
  transform: scale(1.15);
}

.exercise-item.completed {
  opacity: 0.4;
}

.exercise-item.upcoming {
  opacity: 0.25;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.dot.exercise {
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  box-shadow: 0 0 8px rgba(255, 107, 53, 0.5);
}

.dot.rest {
  background: linear-gradient(135deg, var(--rest-start), var(--rest-end));
  box-shadow: 0 0 8px rgba(0, 201, 255, 0.5);
}

.name {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
