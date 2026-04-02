let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    audioContext = AudioContextConstructor ? new AudioContextConstructor() : null
  }

  return audioContext
}

function envelope(gainNode: GainNode, now: number, values: [number, number, number]) {
  const [attack, decay, sustain] = values
  gainNode.gain.cancelScheduledValues(now)
  gainNode.gain.setValueAtTime(0.0001, now)
  gainNode.gain.exponentialRampToValueAtTime(attack, now + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(decay, now + 0.12)
  gainNode.gain.exponentialRampToValueAtTime(sustain, now + 0.28)
}

export function playCartPop() {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.connect(ctx.destination)
  master.gain.value = 0.22

  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(210, now)
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.08)
  osc.frequency.exponentialRampToValueAtTime(170, now + 0.25)

  const gain = ctx.createGain()
  envelope(gain, now, [0.3, 0.08, 0.0001])

  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length)
  }

  noise.buffer = buffer

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1100

  const noiseGain = ctx.createGain()
  envelope(noiseGain, now, [0.12, 0.03, 0.0001])

  osc.connect(gain).connect(master)
  noise.connect(noiseFilter).connect(noiseGain).connect(master)

  osc.start(now)
  osc.stop(now + 0.35)
  noise.start(now)
  noise.stop(now + 0.18)
}

export function playHoverTick() {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(540, now)
  osc.frequency.exponentialRampToValueAtTime(820, now + 0.06)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.1)
}
