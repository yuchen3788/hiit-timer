import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Plan, TimerStatus, TimerPhase } from '@/types'
import {
  playPhaseChangeBeep,
  playCompleteBeep,
  vibrate,
  playCountdownBeep,
} from '@/utils/audio'

export const useTimerStore = defineStore('timer', () => {
  const currentPlan = ref<Plan | null>(null)
  const status = ref<TimerStatus>('idle')
  const currentRound = ref(1)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)
  const phase = ref<TimerPhase>('exercise')

  let animFrameId: number | null = null
  let intervalId: ReturnType<typeof setInterval> | null = null
  let targetTime = 0

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
    startTicking()
  }

  function pause() {
    if (status.value !== 'running') return
    status.value = 'paused'
    stopTicking()
  }

  function reset() {
    stopTicking()
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
    const diff = targetTime - now
    const newRemaining = Math.max(0, Math.ceil(diff / 1000))

    if (newRemaining <= 0) {
      remainingSeconds.value = 0
      advancePhase()
      return
    }

    if (newRemaining !== remainingSeconds.value) {
      if (newRemaining >= 1) {
        playCountdownBeep()
      }
      remainingSeconds.value = newRemaining
    }
  }

  function updateDisplay() {
    tick()
    if (status.value === 'running') {
      animFrameId = requestAnimationFrame(updateDisplay)
    }
  }

  function startTicking() {
    stopTicking()
    intervalId = setInterval(tick, 200)
    animFrameId = requestAnimationFrame(updateDisplay)
  }

  function stopTicking() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  function startNextPhase(duration: number) {
    remainingSeconds.value = duration
    targetTime = Date.now() + duration * 1000
    playPhaseChangeBeep()
    vibrate()
  }

  function advancePhase() {
    if (!currentPlan.value) return

    const plan = currentPlan.value
    const exercises = plan.exercises

    if (phase.value === 'exercise') {
      if (currentExerciseIndex.value < exercises.length - 1) {
        // 同一轮次内，切换到下一个动作前的休息
        phase.value = 'rest'
        startNextPhase(plan.restDuration)
      } else {
        // 当前轮次结束
        if (currentRound.value < plan.rounds) {
          // 还有下一轮，进入大休息
          phase.value = 'rest'
          startNextPhase(plan.roundRestDuration)
        } else {
          // 全部结束
          complete()
        }
      }
    } else {
      // 休息结束，进入下一个动作或下一轮
      // 注意：这里的逻辑有问题，应该在进入 rest 之前就更新 index 还是在 rest 之后？
      // 通常是在 rest 结束时，准备开始下一个 exercise
      
      // 检查是否需要进入下一轮
      // 如果当前是最后一个动作后的休息（roundRest），那么索引重置，轮次+1
      // 如果是普通动作间的休息，索引+1
      
      // 我们需要知道刚才结束的是哪个动作
      // 但由于 phase 只是 string，我们最好在进入 rest 时不要改变 index
      // 现在的逻辑是：
      // exercise(index=0) -> rest(index=0) -> exercise(index=1)
      
      if (currentExerciseIndex.value < exercises.length - 1) {
        currentExerciseIndex.value++
      } else {
        // 只有当我们在最后一项的休息结束时，才进入下一轮
        currentRound.value++
        currentExerciseIndex.value = 0
      }
      phase.value = 'exercise'
      startNextPhase(exercises[currentExerciseIndex.value]!.duration)
    }
  }

  function complete() {
    stopTicking()
    status.value = 'completed'
    playCompleteBeep()
    // 震动反馈
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400])
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
