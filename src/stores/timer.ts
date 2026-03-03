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

  let animFrameId: number | null = null
  let targetTime = 0
  let lastBeepedAt = 0

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
    targetTime = Date.now() + remainingSeconds.value * 1000
    lastBeepedAt = remainingSeconds.value
    scheduleFrame()
  }

  function pause() {
    if (status.value !== 'running') return
    status.value = 'paused'
    cancelFrame()
  }

  function reset() {
    cancelFrame()
    status.value = 'idle'
    if (currentPlan.value) {
      currentRound.value = 1
      currentExerciseIndex.value = 0
      phase.value = 'exercise'
      remainingSeconds.value = currentPlan.value.exercises[0]?.duration ?? 0
    }
  }

  function tick() {
    const now = Date.now()
    const newRemaining = Math.ceil((targetTime - now) / 1000)

    if (newRemaining <= 0) {
      remainingSeconds.value = 0
      advancePhase()
      return
    }

    if (newRemaining !== remainingSeconds.value) {
      remainingSeconds.value = newRemaining
      if (newRemaining <= 3 && newRemaining !== lastBeepedAt) {
        lastBeepedAt = newRemaining
        playCountdownBeep()
      }
    }

    scheduleFrame()
  }

  function scheduleFrame() {
    animFrameId = requestAnimationFrame(tick)
  }

  function cancelFrame() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  function startNextPhase(duration: number) {
    remainingSeconds.value = duration
    targetTime = Date.now() + duration * 1000
    lastBeepedAt = duration
    playPhaseChangeBeep()
    vibrate()
    scheduleFrame()
  }

  function advancePhase() {
    if (!currentPlan.value) return

    const plan = currentPlan.value
    const exercises = plan.exercises

    if (phase.value === 'exercise') {
      if (currentExerciseIndex.value < exercises.length - 1) {
        phase.value = 'rest'
        startNextPhase(plan.restDuration)
      } else {
        if (currentRound.value < plan.rounds) {
          phase.value = 'rest'
          startNextPhase(plan.roundRestDuration)
        } else {
          complete()
        }
      }
    } else {
      if (currentExerciseIndex.value < exercises.length - 1) {
        currentExerciseIndex.value++
      } else {
        currentRound.value++
        currentExerciseIndex.value = 0
      }
      phase.value = 'exercise'
      startNextPhase(exercises[currentExerciseIndex.value]!.duration)
    }
  }

  function complete() {
    cancelFrame()
    status.value = 'idle'
    playCompleteBeep()
    vibrate([200, 100, 200, 100, 400])
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
