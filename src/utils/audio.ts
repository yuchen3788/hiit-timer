let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

export function playBeep() {
  playTone(800, 0.15)
}

export function playPhaseChangeBeep() {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  ;[0, 0.15, 0.3].forEach((delay) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, now + delay)
    gain.gain.setValueAtTime(0.5, now + delay)
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + delay)
    osc.stop(now + delay + 0.12)
  })
}

export function playCompleteBeep() {
  playTone(1200, 0.8, 'sine')
}

export function playCountdownBeep() {
  playTone(600, 0.1)
}

export function vibrate(pattern: number | number[] = 200) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
