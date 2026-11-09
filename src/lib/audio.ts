/**
 * Procedural Web Audio API Micro-Haptics Engine
 * Zero dependencies, zero external media assets, 0ms latency.
 * Provides subtle tactile feedback for interactive navigation and actions.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const val = localStorage.getItem('token_tracker_sfx')
  // Default to enabled (true)
  return val === null ? true : val === 'true'
}

export function setAudioEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('token_tracker_sfx', enabled ? 'true' : 'false')
}

/**
 * 14ms subtle mechanical triangle-wave click
 */
export function playClick(volume: number = 0.08): void {
  if (!isAudioEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.014)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, ctx.currentTime)

    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.014)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.015)
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * 8ms micro-tick for sliders and rapid navigation
 */
export function playTick(volume: number = 0.04): void {
  if (!isAudioEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, ctx.currentTime)

    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.009)
  } catch {}
}

/**
 * Magnetic snap/latch for modal popups and completions
 */
export function playSnap(volume: number = 0.08): void {
  if (!isAudioEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(160, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1400, ctx.currentTime + 0.004)
    osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.025)

    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start()
    osc2.start(ctx.currentTime + 0.004)
    osc1.stop(ctx.currentTime + 0.035)
    osc2.stop(ctx.currentTime + 0.035)
  } catch {}
}

/**
 * Celebratory gentle harmonic chime for successful exports and resyncs
 */
export function playSuccess(volume: number = 0.07): void {
  if (!isAudioEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04)

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.04)
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + idx * 0.04 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + idx * 0.04)
      osc.stop(ctx.currentTime + idx * 0.04 + 0.23)
    })
  } catch {}
}
