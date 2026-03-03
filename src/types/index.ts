export interface Exercise {
  id: string
  name: string
  duration: number
}

export interface Plan {
  id: string
  name: string
  exercises: Exercise[]
  restDuration: number
  roundRestDuration: number
  rounds: number
}

export type TimerStatus = 'idle' | 'running' | 'paused'

export type TimerPhase = 'exercise' | 'rest'

export interface TimerState {
  status: TimerStatus
  currentRound: number
  currentExerciseIndex: number
  remainingSeconds: number
  phase: TimerPhase
}
