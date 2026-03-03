let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function ensureAudioUnlocked(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
}

function playToneAt(frequency: number, duration: number, type: OscillatorType = 'sine', when?: number) {
  const ctx = getAudioContext()
  const startTime = when ?? ctx.currentTime

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gainNode.gain.setValueAtTime(0.5, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function playBeep() {
  playToneAt(800, 0.15)
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
  playToneAt(1200, 0.8, 'sine')
}

export function playCountdownBeep() {
  playToneAt(600, 0.1)
}


export function vibrate(pattern: number | number[] = 200) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
