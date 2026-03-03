import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Plan, TimerStatus, TimerPhase } from '@/types'
import {
  playCountdownBeep,
  playPhaseChangeBeep,
  playCompleteBeep,
  vibrate,
} from '@/utils/audio'

export const useTimerStore = defineStore('timer', () => {
  const currentPlan = ref<Plan | null>(null)
  const status = ref<TimerStatus>('idle')
  const currentRound = ref(1)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)
  const phase = ref<TimerPhase>('exercise')

  let intervalId: ReturnType<typeof setInterval> | null = null

  const currentExercise = computed(() => {
    if (!currentPlan.value) return null
    return currentPlan.value.exercises[currentExerciseIndex.value] ?? null
  })

  const currentPhaseDuration = computed(() => {
    if (!currentPlan.value) return 0
    if (phase.value === 'rest') return currentPlan.value.restDuration
    return currentExercise.value?.duration ?? 0
  })

  const progress = computed(() => {
    if (currentPhaseDuration.value === 0) return 0
    return 1 - remainingSeconds.value / currentPhaseDuration.value
  })

  function loadPlan(plan: Plan) {
    reset()
    currentPlan.value = plan
    currentRound.value = 1
    currentExerciseIndex.value = 0
    phase.value = 'exercise'
    remainingSeconds.value = plan.exercises[0]?.duration ?? 0
  }

  function start() {
    if (!currentPlan.value || status.value === 'running') return
    status.value = 'running'
    intervalId = setInterval(tick, 1000)
  }

  function pause() {
    if (status.value !== 'running') return
    status.value = 'paused'
    clearTimer()
  }

  function reset() {
    clearTimer()
    status.value = 'idle'
    if (currentPlan.value) {
      currentRound.value = 1
      currentExerciseIndex.value = 0
      phase.value = 'exercise'
      remainingSeconds.value = currentPlan.value.exercises[0]?.duration ?? 0
    }
  }

  function tick() {
    if (remainingSeconds.value <= 1) {
      advancePhase()
      return
    }

    remainingSeconds.value--

    if (remainingSeconds.value <= 3) {
      playCountdownBeep()
    }
  }

  function advancePhase() {
    if (!currentPlan.value) return

    const plan = currentPlan.value
    const exercises = plan.exercises

    if (phase.value === 'exercise') {
      // 运动结束 → 检查是否需要休息
      if (currentExerciseIndex.value < exercises.length - 1) {
        // 还有下一个动作，进入休息
        phase.value = 'rest'
        remainingSeconds.value = plan.restDuration
        playPhaseChangeBeep()
        vibrate()
      } else {
        // 当前轮最后一个动作完成
        if (currentRound.value < plan.rounds) {
          // 还有下一轮，使用轮间休息时长
          phase.value = 'rest'
          remainingSeconds.value = plan.roundRestDuration
          playPhaseChangeBeep()
          vibrate()
        } else {
          // 全部完成
          complete()
        }
      }
    } else {
      // 休息结束 → 进入下一个动作
      if (currentExerciseIndex.value < exercises.length - 1) {
        currentExerciseIndex.value++
      } else {
        // 进入下一轮
        currentRound.value++
        currentExerciseIndex.value = 0
      }
      phase.value = 'exercise'
      remainingSeconds.value = exercises[currentExerciseIndex.value]!.duration
      playPhaseChangeBeep()
      vibrate()
    }
  }

  function complete() {
    clearTimer()
    status.value = 'idle'
    playCompleteBeep()
    vibrate([200, 100, 200, 100, 400])
  }

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return {
    currentPlan,
    status,
    currentRound,
    currentExerciseIndex,
    remainingSeconds,
    phase,
    currentExercise,
    currentPhaseDuration,
    progress,
    loadPlan,
    start,
    pause,
    reset,
  }
})
